import { Encrypter, KeyStore } from "./types";

export const PluginTesting = {
  testEncrypter(encrypter: Encrypter): boolean {
    return !!encrypter;
  },

  testKeyStore(keyStore: KeyStore): boolean {
    return !!keyStore;
  },
};
