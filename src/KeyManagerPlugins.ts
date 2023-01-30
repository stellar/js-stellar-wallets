import { BrowserStorageKeyStore } from "./plugins/BrowserStorageKeyStore";
import { IdentityEncrypter } from "./plugins/IdentityEncrypter";
import { LocalStorageKeyStore } from "./plugins/LocalStorageKeyStore";
import { MemoryKeyStore } from "./plugins/MemoryKeyStore";
import { ScryptEncrypter } from "./plugins/ScryptEncrypter";
import { Encrypter } from "./types";

export interface KeyManagerPlugin {
  BrowserStorageKeyStore: typeof BrowserStorageKeyStore;
  MemoryKeyStore: typeof MemoryKeyStore;
  LocalStorageKeyStore: typeof LocalStorageKeyStore;
  IdentityEncrypter: Encrypter;
  ScryptEncrypter: Encrypter;
}
export type {
  BrowserStorageKeyStore,
  MemoryKeyStore,
  LocalStorageKeyStore,
  IdentityEncrypter,
  ScryptEncrypter,
};

export const KeyManagerPlugins: KeyManagerPlugin = {
  BrowserStorageKeyStore,
  MemoryKeyStore,
  LocalStorageKeyStore,
  IdentityEncrypter,
  ScryptEncrypter,
};
