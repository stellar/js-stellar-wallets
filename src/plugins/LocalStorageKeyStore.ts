import { getKeyMetadata } from "../helpers/getKeyMetadata";
import { EncryptedKey, KeyMetadata, KeyStore } from "../types";
import {
  LocalStorageConfigParams,
  LocalStorageFacade,
} from "./LocalStorageFacade";

/**
 * KeyStore for the Web Storage API :
 * https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API.
 * Once instantiated and configured, pass it to the `KeyManager` contructor to
 * handle the storage of encrypted keys.
 * ```js
 * const localKeyStore = new KeyManagerPlugins.LocalStorageKeyStore();
 * localKeyStore.configure({ storage: localStorage });
 * const keyManager = new KeyManager({
 *     keyStore: localKeyStore
 *  });
 * ```
 */
export class LocalStorageKeyStore implements KeyStore {
  public name: string;
  private keyStore: LocalStorageFacade;

  constructor() {
    this.name = "LocalStorageKeyStore";
    this.keyStore = new LocalStorageFacade();
  }

  /**
   * The configuration is where the storage engine is set up and configured.
   * It must follow the Storage interface :
   * https://developer.mozilla.org/en-US/docs/Web/API/Storage).
   * In the DOM environment it can be `localStorage` or `sessionStorage`.
   * In a Node environment, there are some substitution libraries available,
   * *node-localstorage* for instance.
   * If not set, the calls to the other methods will fail.
   * @param {LocalStorageConfigParams} params A configuration object.
   * @param {Storage} params.storage The Storage instance. Required.
   * @param {string} [params.prefix] The prefix for the names in the storage.
   * @return {Promise}
   */
  public configure(params: LocalStorageConfigParams) {
    try {
      this.keyStore.configure(params);
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
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
