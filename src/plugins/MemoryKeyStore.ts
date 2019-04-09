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
        encryptedKey,
      };
      metadata.push(
        getMetadataFromMemoryItem({
          encryptedKey,
          creationTime,
          modifiedTime,
        }),
      );
    });
    return Promise.resolve(metadata);
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
