import { EncryptedKey } from "../types";

export interface BrowserStorageConfigParams {
  prefix?: string;
  storage: {
    get: (key?: string | string[] | {}) => Promise<{}>;
    remove: (key: string | string[]) => Promise<void>;
    set: (items: {}) => Promise<{}>;
  };
}

const PREFIX = "stellarkeys";

/**
 * Facade for `BrowserStorageKeyStore` encapsulating the access to the actual
 * browser storage
 */
export class BrowserStorageFacade {
  private storage: Storage | null;
  private prefix: string;

  constructor() {
    this.storage = null;
    this.prefix = PREFIX;
  }

  public configure(params: BrowserStorageConfigParams) {
    Object.assign(this, params);
  }

  public async hasKey(id: string) {
    this.check();

    return this.storage !== null
      ? !!Object.keys(await this.storage.get(`${this.prefix}:${id}`)).length
      : null;
  }

  public async getKey(id: string) {
    this.check();
    const key = `${this.prefix}:${id}`;
    const itemObj = this.storage !== null ? await this.storage.get(key) : null;

    const item = itemObj[key];
    return item || null;
  }

  public setKey(id: string, key: EncryptedKey) {
    this.check();
    return this.storage !== null
      ? this.storage.set({ [`${this.prefix}:${id}`]: { ...key } })
      : null;
  }

  public removeKey(id: string) {
    this.check();
    return this.storage !== null
      ? this.storage.remove(`${this.prefix}:${id}`)
      : null;
  }

  public async getAllKeys() {
    this.check();
    const regexp = RegExp(`^${PREFIX}\\:(.*)`);
    const keys: EncryptedKey[] = [];

    if (this.storage !== null) {
      const storageObj = await this.storage.get(null);
      const storageKeys = Object.keys(storageObj);
      for (const storageKey of storageKeys) {
        const raw_id = storageKey;
        if (raw_id !== null && regexp.test(raw_id)) {
          const key = await this.getKey(regexp.exec(raw_id)![1]);
          if (key !== null) {
            keys.push(key);
          }
        }
      }
    }
    return keys;
  }

  private check() {
    if (this.storage === null) {
      throw new Error("A storage object must have been set");
    }
    if (this.prefix === "") {
      throw new Error("A non-empty prefix must have been set");
    }
    return this.storage !== null && this.prefix !== "";
  }
}
