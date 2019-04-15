import scrypt from "scrypt-async";
import nacl from "tweetnacl";
import naclutil from "tweetnacl-util";

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

interface EncryptParams {
  phrase: string;
  password: string;

  // these should only be used for testing!
  salt?: string;
  nonce?: Uint8Array;
}

interface EncryptResponse {
  encryptedPhrase: string;
  salt: string;
}

interface DecryptParams {
  phrase: string;
  password: string;
  salt: string;
}

export async function encrypt({
  phrase,
  password,
  salt,
  nonce,
}: EncryptParams): Promise<EncryptResponse> {
  const scryptSalt = salt || generateSalt();

  const secretBoxNonce = nonce || nacl.randomBytes(NONCE_BYTES);
  const scryptedPass = await scryptPass({ password, salt: scryptSalt });
  const textBytes = naclutil.decodeUTF8(phrase);
  const cipherText = nacl.secretbox(textBytes, secretBoxNonce, scryptedPass);

  if (!cipherText) {
    throw new Error("Encryption failed");
  }

  // merge these into one array
  // (in a somewhat ugly way, since TS doesn't like destructuring Uint8Arrays)
  const bundle = new Uint8Array(1 + secretBoxNonce.length + cipherText.length);
  bundle.set([CURRENT_CRYPTO_VERSION]);
  bundle.set(secretBoxNonce, 1);
  bundle.set(cipherText, 1 + secretBoxNonce.length);

  return {
    encryptedPhrase: naclutil.encodeBase64(bundle),
    salt: scryptSalt,
  };
}

export async function decrypt({
  phrase,
  password,
  salt,
}: DecryptParams): Promise<string> {
  const scryptedPass = await scryptPass({ password, salt });

  const bundle = naclutil.decodeBase64(phrase);
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
  return naclutil.encodeUTF8(decryptedBytes);
}
