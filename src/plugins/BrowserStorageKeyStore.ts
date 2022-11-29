import { getKeyMetadata } from "../helpers/getKeyMetadata";
import { EncryptedKey, KeyMetadata, KeyStore } from "../types";
import {
  BrowserStorageConfigParams,
  BrowserStorageFacade,
} from "./BrowserStorageFacade";

/**
 * KeyStore for Chrome and Firefox browser storage API:
 * https://developer.chrome.com/docs/extensions/reference/storage/.
 * Once instantiated and configured, pass it to the `KeyManager` contructor to
 * handle the storage of encrypted keys.
 * ```js
 * const browserKeyStore = new KeyManagerPlugins.BrowserStorageKeyStore();
 * browserKeyStore.configure({ storage: chrome.storage.local });
 * const keyManager = new KeyManager({
 *     keyStore: browserKeyStore
 *  });
 * ```
 */
export class BrowserStorageKeyStore implements KeyStore {
  public name: string;
  private keyStore: BrowserStorageFacade;

  constructor() {
    this.name = "BrowserStorageKeyStore";
    this.keyStore = new BrowserStorageFacade();
  }

  /**
   * The configuration is where the storage engine is set up and configured.
   * It must follow the Storage interface :
   * https://developer.chrome.com/docs/extensions/reference/storage/).
   * This is mostly for use with Chrome and Firefox storage in addition to
   * libraries that shim this (for ex: webextension-polyfill)
   * @param {BrowserStorageConfigParams} params A configuration object.
   * @param {Storage} params.storage The Storage instance. Required.
   * @param {string} [params.prefix] The prefix for the names in the storage.
   * @return {Promise}
   */
  public configure(params: BrowserStorageConfigParams) {
    try {
      this.keyStore.configure(params);
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  }

  public async storeKeys(keys: EncryptedKey[]) {
    // We can't store keys if they're already there
    const invalidKeys: EncryptedKey[] = [];

    for (const encryptedKey of keys) {
      const hasKey = await this.keyStore.hasKey(encryptedKey.id);
      if (hasKey) {
        invalidKeys.push(encryptedKey);
      }
    }

    if (invalidKeys.length) {
      return Promise.reject(
        `Some keys were already stored in the keystore: ${invalidKeys
          .map((k) => k.id)
          .join(", ")}`,
      );
    }

    const keysMetadata: KeyMetadata[] = [];

    for (const encryptedKey of keys) {
      this.keyStore.setKey(encryptedKey.id, encryptedKey);
      keysMetadata.push(getKeyMetadata(encryptedKey));
    }

    return Promise.resolve(keysMetadata);
  }

  public updateKeys(keys: EncryptedKey[]) {
    // we can't update keys if they're already stored
    const invalidKeys: EncryptedKey[] = keys.filter(
      async (encryptedKey: EncryptedKey) =>
        !(await this.keyStore.hasKey(encryptedKey.id)),
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

  public async loadKey(id: string) {
    const key = await this.keyStore.getKey(id);
    if (!key) {
      return Promise.reject(id);
    }
    return Promise.resolve(key);
  }

  public async removeKey(id: string) {
    if (!this.keyStore.hasKey(id)) {
      return Promise.reject(id);
    }

    const key = await this.keyStore.getKey(id);
    const metadata: KeyMetadata = getKeyMetadata(key);
    this.keyStore.removeKey(id);

    return Promise.resolve(metadata);
  }

  public async loadAllKeys() {
    const keys = await this.keyStore.getAllKeys();
    return Promise.resolve(keys);
  }
}
