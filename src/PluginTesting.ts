import StellarSdk from "stellar-sdk";
import { KeyType } from "./constants/keys";
import { Encrypter, KeyStore } from "./types";

export const PluginTesting = {
  async testEncrypter(encrypter: Encrypter): Promise<void> {
    const account = StellarSdk.Keypair.random();

    const key = {
      type: KeyType.plaintextKey,
      publicKey: account.publicKey(),
      privateKey: account.secret(),
    };

    const password = "kh2fu0b939uvdkj";

    const encryptedKey = await encrypter.encryptKey({
      key,
      password,
    });

    if (!encryptedKey) {
      return Promise.reject(
        new Error("[Encrypter.encryptKey] No encrypted key returned"),
      );
    }

    if (!encryptedKey.encryptedPrivateKey) {
      return Promise.reject(
        new Error(
          "[Encrypter.encryptKey] Encrypter didn't return encrypted key",
        ),
      );
    }

    if (encryptedKey.encryptedPrivateKey === key.privateKey) {
      return Promise.reject(
        new Error(
          "[Encrypter.encryptKey] Encrypted key is the same as the private key",
        ),
      );
    }

    const decryptedKey = await encrypter.decryptKey({
      encryptedKey,
      password,
    });

    if (!decryptedKey) {
      return Promise.reject(
        new Error("[Encrypter.decryptKey] No decrypted key returned"),
      );
    }

    if (decryptedKey.privateKey === encryptedKey.encryptedPrivateKey) {
      return Promise.reject(
        new Error(
          "[Encrypter.decryptKey] Decrypted key is the same as the encrypted key",
        ),
      );
    }

    if (decryptedKey.privateKey !== key.privateKey) {
      return Promise.reject(
        new Error(
          "[Encrypter.decryptKey] Decrypted key doesn't match original key",
        ),
      );
    }

    return Promise.resolve();
  },

  async testKeyStore(keyStore: KeyStore): Promise<void> {
    console.log(keyStore);
    return Promise.resolve();
  },
};
