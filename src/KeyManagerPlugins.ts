import { BrowserStorageKeyStore } from "./plugins/BrowserStorageKeyStore";
import { IdentityEncrypter } from "./plugins/IdentityEncrypter";
import { LocalStorageKeyStore } from "./plugins/LocalStorageKeyStore";
import { MemoryKeyStore } from "./plugins/MemoryKeyStore";
import { ScryptEncrypter } from "./plugins/ScryptEncrypter";

export const KeyManagerPlugins: any = {
  BrowserStorageKeyStore,
  IdentityEncrypter,
  MemoryKeyStore,
  LocalStorageKeyStore,
  ScryptEncrypter,
};
