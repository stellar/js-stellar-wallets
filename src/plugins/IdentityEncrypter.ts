import { EncryptedKey, Encrypter, Key } from "../types";

const NAME = "IdentityEncrypter";

/**
 * "Encrypt" keys in a very basic, naive way.
 */
export const IdentityEncrypter: Encrypter = {
  name: NAME,
  encryptKey({ key }: { key: Key }) {
    const { type, privateKey, publicKey, path, extra, ...props } = key;

    return Promise.resolve({
      ...props,
      encryptedBlob: JSON.stringify({
        type,
        publicKey,
        privateKey,
        path,
        extra,
      }),
      encrypterName: NAME,
      salt: "identity",
    });
  },

  decryptKey({ encryptedKey }: { encryptedKey: EncryptedKey }) {
    const {
      encrypterName,
      salt,
      encryptedBlob,
      ...props
    } = encryptedKey as any;

    const data = JSON.parse(encryptedBlob);

    return Promise.resolve({ ...props, ...data });
  },
};
