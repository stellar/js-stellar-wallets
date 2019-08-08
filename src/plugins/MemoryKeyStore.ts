import { getKeyMetadata } from "../helpers/getKeyMetadata";
import { EncryptedKey, KeyMetadata, KeyStore } from "../types";

interface MemoryStorer {
  [id: string]: EncryptedKey;
}

function getNow() {
  return Math.floor(Date.now());
}

export class MemoryKeyStore implements KeyStore {
  public name: string;
  private keyStore: MemoryStorer;

  constructor() {
    this.name = "MemoryKeyStore";
    this.keyStore = {};
  }

  public configure() {
    return Promise.resolve();
  }

  public storeKeys(keys: EncryptedKey[]) {
    // We can't store keys if they're already there
    const invalidKeys: EncryptedKey[] = keys.filter(
      (encryptedKey: EncryptedKey) => !!this.keyStore[encryptedKey.id],
    );

    if (invalidKeys.length) {
      return Promise.reject(
        `Some keys were already stored in the keystore: ${invalidKeys
          .map((k) => k.id)
          .join(", ")}`,
      );
    }

    const keysMetadata = keys.map((encryptedKey: EncryptedKey) => {
      const creationTime = getNow();
      const modifiedTime = getNow();

      this.keyStore[encryptedKey.id] = {
        ...encryptedKey,
        creationTime,
        modifiedTime,
      };

      return getKeyMetadata(this.keyStore[encryptedKey.id]);
    });

    return Promise.resolve(keysMetadata);
  }

  public updateKeys(keys: EncryptedKey[]) {
    // we can't update keys if they're already stored
    const invalidKeys: EncryptedKey[] = keys.filter(
      (encryptedKey: EncryptedKey) => !this.keyStore[encryptedKey.id],
    );

    if (invalidKeys.length) {
      return Promise.reject(
        `Some keys couldn't be found in the keystore: ${invalidKeys
          .map((k) => k.id)
          .join(", ")}`,
      );
    }

    const keysMetadata = keys.map((encryptedKey: EncryptedKey) => {
      const id = encryptedKey.id;
      const creationTime = this.keyStore[id].creationTime;
      const modifiedTime = getNow();

      this.keyStore[id] = {
        ...encryptedKey,
        creationTime,
        modifiedTime,
      };

      return getKeyMetadata(this.keyStore[id]);
    });

    return Promise.resolve(keysMetadata);
  }

  public loadKey(id: string) {
    return Promise.resolve(this.keyStore[id]);
  }

  public removeKey(id: string) {
    if (!this.keyStore[id]) {
      return Promise.reject(id);
    }

    const metadata: KeyMetadata = getKeyMetadata(this.keyStore[id]);
    delete this.keyStore[id];

    return Promise.resolve(metadata);
  }

  public loadAllKeyMetadata() {
    return Promise.resolve(Object.values(this.keyStore).map(getKeyMetadata));
  }

  public loadAllKeys() {
    return Promise.resolve(
      Object.values(this.keyStore).map((item: EncryptedKey) => item),
    );
  }
}
