import { IdentityEncrypter } from "./plugins/IdentityEncrypter";
import { MemoryKeyStore } from "./plugins/MemoryKeyStore";
import { ScryptEncrypter } from "./plugins/ScryptEncrypter";

export const KeyManagerPlugins: any = {
  IdentityEncrypter,
  MemoryKeyStore,
  ScryptEncrypter,
};
