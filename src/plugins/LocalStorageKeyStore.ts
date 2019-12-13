import { getKeyMetadata } from "../helpers/getKeyMetadata";
import { EncryptedKey, KeyMetadata, KeyStore } from "../types";
import {
  LocalStorageConfigParams,
  LocalStorageFacade,
} from "./LocalStorageFacade";

export class LocalStorageKeyStore implements KeyStore {
  public name: string;
  private keyStore: LocalStorageFacade;

  constructor() {
    this.name = "LocalStorageKeyStore";
    this.keyStore = new LocalStorageFacade();
  }

  public configure(params: LocalStorageConfigParams) {
    return this.keyStore.configure(params);
  }

  public storeKeys(keys: EncryptedKey[]) {
    // We can't store keys if they're already there
    const invalidKeys: EncryptedKey[] = keys.filter(
      (encryptedKey: EncryptedKey) => this.keyStore.hasKey(encryptedKey.id),
    );

    if (invalidKeys.length) {
      return Promise.reject(
        `Some keys were already stored in the keystore: ${invalidKeys
          .map((k) => k.id)
          .join(", ")}`,
      );
    }

    const keysMetadata = keys.map((encryptedKey: EncryptedKey) => {
      this.keyStore.setKey(encryptedKey.id, encryptedKey);
      return getKeyMetadata(encryptedKey);
    });

    return Promise.resolve(keysMetadata);
  }

  public updateKeys(keys: EncryptedKey[]) {
    // we can't update keys if they're already stored
    const invalidKeys: EncryptedKey[] = keys.filter(
      (encryptedKey: EncryptedKey) => !this.keyStore.hasKey(encryptedKey.id),
    );

    if (invalidKeys.length) {
      return Promise.reject(
        `Some keys couldn't be found in the keystore: ${invalidKeys
          .map((k) => k.id)
          .join(", ")}`,
      );
    }

    const keysMetadata = keys.map((encryptedKey: EncryptedKey) => {
      this.keyStore.setKey(encryptedKey.id, encryptedKey);
      return getKeyMetadata(encryptedKey);
    });

    return Promise.resolve(keysMetadata);
  }

  public loadKey(id: string) {
    const key = this.keyStore.getKey(id);
    if (!key) {
      return Promise.reject(id);
    }
    return Promise.resolve(key);
  }

  public removeKey(id: string) {
    if (!this.keyStore.hasKey(id)) {
      return Promise.reject(id);
    }

    const metadata: KeyMetadata = getKeyMetadata(this.keyStore.getKey(id));
    this.keyStore.removeKey(id);

    return Promise.resolve(metadata);
  }

  public loadAllKeys() {
    return Promise.resolve(this.keyStore.getAllKeys());
  }
}
