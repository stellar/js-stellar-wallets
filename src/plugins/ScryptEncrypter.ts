import scrypt from "scrypt-async";
import nacl from "tweetnacl";
import naclutil from "tweetnacl-util";

import { EncryptedKey, Key } from "../types";

const NAME = "ScryptEncrypter";

export const RECOVERY_CODE_NBITS = 160;
export const RECOVERY_CODE_NWORDS = (RECOVERY_CODE_NBITS / 32) * 3;
export const SALT_BYTES = 32;
export const NONCE_BYTES = nacl.secretbox.nonceLength; // 24 bytes
export const LOCAL_KEY_BYTES = nacl.secretbox.keyLength; // 32 bytes
export const CRYPTO_V1 = 1;
export const CURRENT_CRYPTO_VERSION = CRYPTO_V1;
export const KEY_LEN = nacl.secretbox.keyLength; // 32 bytes

/**
 * Convert password from user into a derived key for encryption
 * @param {string} param.password plaintext password from user
 * @param {string} param.salt salt (should be randomly generated)
 * @param {number} param.dkLen length of the derived key to output
 * @returns {Uint8Array} bytes of the derived key
 */
function scryptPass({
  password,
  salt,
  dkLen = KEY_LEN,
}: {
  password: string;
  salt: string;
  dkLen?: number;
}): Promise<Uint8Array> {
  const [N, r, p] = [32768, 8, 1];
  return new Promise((resolve, reject) => {
    scrypt(
      password,
      salt,
      { N, r, p, dkLen, encoding: "binary" },
      (derivedKey: Uint8Array) => {
        if (derivedKey) {
          resolve(derivedKey);
        } else {
          reject(new Error("scryptPass failed, derivedKey is null"));
        }
      },
    );
  });
}

function generateSalt(): string {
  return naclutil.encodeBase64(nacl.randomBytes(SALT_BYTES));
}

/**
 * "Encrypt" keys in a very basic, naive way.
 */
export const ScryptEncrypter = {
  name: NAME,
  async encryptKey({
    key,
    password,
  }: {
    key: Key;
    password: string;
  }): Promise<EncryptedKey> {
    const salt = generateSalt();

    const { privateKey, ...secretlessKey } = key;

    const nonceBytes = nacl.randomBytes(NONCE_BYTES);
    const scryptedPass = await scryptPass({ password, salt });
    const textBytes = naclutil.decodeUTF8(privateKey);
    const cipherText = nacl.secretbox(textBytes, nonceBytes, scryptedPass);

    if (!cipherText) {
      throw new Error("Encryption failed");
    }

    // merge these into one array
    // (in a somewhat ugly way, since TS doesn't like destructuring Uint8Arrays)
    const bundle = new Uint8Array(1 + nonceBytes.length + cipherText.length);
    bundle.set([CURRENT_CRYPTO_VERSION]);
    bundle.set(nonceBytes, 1);
    bundle.set(cipherText, 1 + nonceBytes.length);

    const encryptedPrivateKey = naclutil.encodeBase64(bundle);

    return Promise.resolve({
      ...secretlessKey,
      encryptedPrivateKey,
      encrypterName: NAME,
      salt,
    });
  },
  async decryptKey({
    encryptedKey,
    password,
  }: {
    encryptedKey: EncryptedKey;
    password: string;
  }) {
    const { encrypterName, salt, encryptedPrivateKey, ...key } = encryptedKey;

    const scryptedPass = await scryptPass({ password, salt });

    const bundle = naclutil.decodeBase64(encryptedPrivateKey);
    const version = bundle[0];
    let decryptedBytes;
    if (version === CRYPTO_V1) {
      const nonce = bundle.slice(1, 1 + NONCE_BYTES);
      const cipherText = bundle.slice(1 + NONCE_BYTES);
      decryptedBytes = nacl.secretbox.open(cipherText, nonce, scryptedPass);
    } else {
      throw new Error(`Cipher version ${version} not supported.`);
    }
    if (!decryptedBytes) {
      throw new Error("That passphrase wasn’t valid.");
    }
    const privateKey = naclutil.encodeUTF8(decryptedBytes);

    return Promise.resolve({ ...key, privateKey });
  },
};
