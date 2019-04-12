import { EncryptedKey, Key } from "../types";

const NAME = "IdentityEncrypter";

/**
 * "Encrypt" keys in a very basic, naive way.
 */
export const IdentityEncrypter = {
  name: NAME,
  encryptKey({ key }: { key: Key }) {
    const { privateKey, ...secretlessKey } = key;

    return Promise.resolve({
      ...secretlessKey,
      encryptedPrivateKey: privateKey,
      encrypterName: NAME,
      salt: "identity",
    });
  },
  decryptKey({ encryptedKey }: { encryptedKey: EncryptedKey }) {
    const {
      encrypterName,
      salt,
      encryptedPrivateKey,
      ...key
    } = encryptedKey as any;
    return Promise.resolve({ ...key, privateKey: encryptedPrivateKey });
  },
};
