import { EncryptedKey, KeyMetadata, KeyStore } from "../types";

interface MemoryItem {
  creationTime: number;
  modifiedTime: number;
  key: EncryptedKey;
}

interface MemoryStorer {
  [publicKey: string]: MemoryItem;
}

function getNow() {
  return Math.floor(Date.now());
}

function getMetadataFromMemoryItem(item: MemoryItem): KeyMetadata {
  return {
    ...item.key.key,
    encrypterName: item.key.encrypterName,
    creationTime: item.creationTime,
    modifiedTime: item.modifiedTime,
  };
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
    const metadata: KeyMetadata[] = [];
    keys.forEach((encryptedKey: EncryptedKey) => {
      const publicKey = encryptedKey.key.publicKey;
      const creationTime = this.keyStore[publicKey]
        ? this.keyStore[publicKey].creationTime
        : getNow();
      const modifiedTime = getNow();
      this.keyStore[publicKey] = {
        creationTime,
        modifiedTime,
        key: encryptedKey,
      };
      metadata.push({
        ...encryptedKey.key,
        encrypterName: encryptedKey.encrypterName,
        creationTime,
        modifiedTime,
      });
    });
    return Promise.resolve(metadata);
  }

  public loadKey(publicKey: string) {
    return Promise.resolve(
      this.keyStore[publicKey] ? this.keyStore[publicKey].key : undefined,
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
      Object.values(this.keyStore).map((item: MemoryItem) => item.key),
    );
  }
}
