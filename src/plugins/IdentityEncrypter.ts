import { isLedgerKey } from "../KeyHelpers";

import { EncryptedKey, Key, PlaintextKey } from "../types";

const NAME = "IdentityEncrypter";

/**
 * "Encrypt" keys in a very basic, naive way.
 */
export const IdentityEncrypter = {
  name: NAME,
  encryptKey({ key }: { key: Key }) {
    if (isLedgerKey(key)) {
      return Promise.resolve({
        ...key,
        encrypterName: NAME,
        salt: "identity",
      });
    }

    const { privateKey, ...secretlessKey } = key as PlaintextKey;

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
