import { getKeyMetadata } from "../KeyHelpers";
import { EncryptedKey, KeyMetadata, KeyStore } from "../types";

interface MemoryItem {
  creationTime: number;
  modifiedTime: number;
  encryptedKey: EncryptedKey;
}

interface MemoryStorer {
  [publicKey: string]: MemoryItem;
}

function getNow() {
  return Math.floor(Date.now());
}

function getMetadataFromMemoryItem(item: any): KeyMetadata {
  return getKeyMetadata(item);
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
      (encryptedKey: EncryptedKey) => !!this.keyStore[encryptedKey.publicKey],
    );

    if (invalidKeys.length) {
      return Promise.reject(
        `Some keys were already stored in the keystore: ${invalidKeys
          .map((k) => k.publicKey)
          .join(", ")}`,
      );
    }

    const keysMetadata = keys.map((encryptedKey: EncryptedKey) => {
      const creationTime = getNow();
      const modifiedTime = getNow();
      this.keyStore[encryptedKey.publicKey] = {
        creationTime,
        modifiedTime,
        encryptedKey,
      };
      return getMetadataFromMemoryItem({
        encryptedKey,
        creationTime,
        modifiedTime,
      });
    });
    return Promise.resolve(keysMetadata);
  }

  public updateKeys(keys: EncryptedKey[]) {
    // we can't update keys if they're already stored
    const invalidKeys: EncryptedKey[] = keys.filter(
      (encryptedKey: EncryptedKey) => !this.keyStore[encryptedKey.publicKey],
    );
    if (invalidKeys.length) {
      return Promise.reject(
        `Some keys couldn't be found in the keystore: ${invalidKeys
          .map((k) => k.publicKey)
          .join(", ")}`,
      );
    }

    const keysMetadata = keys.map((encryptedKey: EncryptedKey) => {
      const publicKey = encryptedKey.publicKey;
      const creationTime = this.keyStore[publicKey].creationTime;
      const modifiedTime = getNow();
      this.keyStore[publicKey] = {
        creationTime,
        modifiedTime,
        encryptedKey,
      };
      return getMetadataFromMemoryItem({
        encryptedKey,
        creationTime,
        modifiedTime,
      });
    });

    return Promise.resolve(keysMetadata);
  }

  public loadKey(publicKey: string) {
    return Promise.resolve(
      this.keyStore[publicKey]
        ? this.keyStore[publicKey].encryptedKey
        : undefined,
    );
  }

  public removeKey(publicKey: string) {
    if (!this.keyStore[publicKey]) {
      return Promise.reject(publicKey);
    }

    const metadata: KeyMetadata = getMetadataFromMemoryItem(
      this.keyStore[publicKey],
    );
    delete this.keyStore[publicKey];

    return Promise.resolve(metadata);
  }

  public loadAllKeyMetadata() {
    return Promise.resolve(
      Object.values(this.keyStore).map(getMetadataFromMemoryItem),
    );
  }

  public loadAllKeys() {
    return Promise.resolve(
      Object.values(this.keyStore).map((item: MemoryItem) => item.encryptedKey),
    );
  }
}
