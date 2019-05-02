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
    const notExist = keys.every(
      (encryptedKey: EncryptedKey) => !this.keyStore[encryptedKey.publicKey],
    );
    if (!notExist) {
      return Promise.reject("some key already exists");
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
    const valid = keys.every(
      (encryptedKey: EncryptedKey) => !!this.keyStore[encryptedKey.publicKey],
    );
    if (!valid) {
      return Promise.reject("some key does not exist");
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

  public listKeys() {
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
