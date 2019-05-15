import { decrypt, encrypt } from "../lib/ScryptEncryption";
import { EncryptedKey, Encrypter, Key } from "../types";

const NAME = "ScryptEncrypter";

/**
 * Encrypt keys with scrypt, as they are on StellarX.com.
 */
export const ScryptEncrypter: Encrypter = {
  name: NAME,
  async encryptKey({
    key,
    password,
  }: {
    key: Key;
    password: string;
  }): Promise<EncryptedKey> {
    const { privateKey, ...secretlessKey } = key;

    const { encryptedPhrase, salt } = await encrypt({
      password,
      phrase: privateKey,
    });

    return Promise.resolve({
      ...secretlessKey,
      encryptedPrivateKey: encryptedPhrase,
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

    return Promise.resolve({
      ...key,
      privateKey: await decrypt({
        phrase: encryptedPrivateKey,
        password,
        salt,
      }),
    });
  },
};
