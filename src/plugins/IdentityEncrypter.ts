import { Key } from "../types";

interface IdentityEncrypterParams {
  key: Key;
}

/**
 * "Encrypt" keys by returning exactly what
 */
export const IdentityEncrypter = {
  name: "IdentityEncrypter",
  encryptKey({ key }: IdentityEncrypterParams) {
    return Promise.resolve(key);
  },
  decryptKey({ key }: IdentityEncrypterParams) {
    return Promise.resolve(key);
  },
};
