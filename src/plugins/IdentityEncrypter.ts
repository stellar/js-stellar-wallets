import { EncryptedKey, Key } from "../types";

const NAME = "IdentityEncrypter";

/**
 * "Encrypt" keys in a very basic, naive way.
 */
export const IdentityEncrypter = {
  name: NAME,
  encryptKey({ key }: { key: Key }) {
    return Promise.resolve({
      key,
      encrypterName: NAME,
      salt: "identity",
    });
  },
  decryptKey({ encryptedKey }: { encryptedKey: EncryptedKey }) {
    return Promise.resolve(encryptedKey.key);
  },
};
