import {
  EncryptedKey,
  Encrypter,
  Key,
  KeyMetadata,
  KeyStore,
  KeyTypeHandler,
} from "./types";

interface KeyManagerParams {
  keyStore: KeyStore;
  keyCache: KeyStore;
  shouldCache: boolean;
}

interface AddKeyArgs {
  key: Key;
  encrypter: string;
  password?: string;
}

interface SignTransactionArgs {
  txnEnvelope: any;
  publicKey: string;
  password?: string;
}

interface ChangePasswordArgs {
  oldPassword: string;
  newPassword: string;
}

/**
 * KeyManager is the main class that is constructed to use the keystore API. It
 * optionally caches keys internally so a user doesn't have to re-decrypt
 * passwords so long as the KeyManager object is around in memory.
 *
 *  It requires the following to function:
 * - KeyStore (passed into constructor)
 * - KeyTypeHandler (one or more passed in via registerKeyHandler)
 * - Encrypter (one or more passed in via registerEncrypter)
 */
export class KeyManager {
  private encrypterMap: { [key: string]: Encrypter } = {};
  private keyStore: KeyStore;
  private keyHandlerMap: { [key: string]: KeyTypeHandler } = {};
  private keyCache: { [publicKey: string]: Key } = {};
  private shouldCache: boolean;

  constructor({ keyStore, shouldCache = true }: KeyManagerParams) {
    this.keyStore = keyStore;
    this.shouldCache = shouldCache;
  }

  public registerKeyHandler(keyHandler: KeyTypeHandler) {
    this.keyHandlerMap[keyHandler.name] = keyHandler;
  }

  public registerEncrypter(encrypter: Encrypter) {
    this.encrypterMap[encrypter.name] = encrypter;
  }

  /**
   * Stores a key in the keyStore after encrypting it with the encrypter.
   *
   * @param key key to store
   * @param password encrypt key with this as the secret
   * @param encrypter encryption algorithm to use (must have been registered)
   *
   * @returns The metadata of the key
   * @throws on any error
   */
  public async storeKey({
    key,
    password,
    encrypter,
  }: AddKeyArgs): Promise<KeyMetadata> {
    // happy path-only code to demonstrate idea
    const encrypterObj = this.encrypterMap[encrypter];
    const keyStoreObj = this.keyStore;
    const encryptedKey = await encrypterObj.encryptKey({ key, password });
    const keyMetadata = await keyStoreObj.storeKeys({
      keys: [encryptedKey],
    });

    this._writeToCache(key.publicKey, key);

    return keyMetadata[0];
  }

  /**
   *  List information about stored keys
   *
   * @returns a list of metadata about all stored keys
   * @throws on any error
   */
  public listKeys(): Promise<KeyMetadata[]> {
    return this.keyStore.listKeys();
  }

  /**
   *  remove the key specified by this publicKey.
   *
   * @param publicKey specifies which key to remove
   * @returns void on success
   * @throws on any error
   */
  public async removeKey({
    publicKey,
  }: {
    publicKey: string;
  }): Promise<KeyMetadata> {
    const res = await this.keyStore.removeKey(publicKey);
    this._writeToCache(publicKey, undefined);
    return res;
  }

  /**
   * Sign a transaction using the specified publicKey. Supports both using a
   * cached key and going out to the keystore to read and decrypt
   *
   * @param txnEnvelope transaction envelope to sign
   * @param publicKey key to sign with
   * @returns signed transaction envelope
   * @throws on any error
   */
  public async signTransaction({
    txnEnvelope,
    publicKey,
    password,
  }: SignTransactionArgs): Promise<any> {
    let key = this._readFromCache(publicKey);

    if (!key) {
      const encryptedKey = await this.keyStore.loadKey({ publicKey });
      const encrypterObj = this.encrypterMap[encryptedKey.encrypterName];
      key = await encrypterObj.decryptKey({ key: encryptedKey, password });
      this._writeToCache(publicKey, key);
    }

    const keyHandler = this.keyHandlerMap[key.type];
    const signedTxnEnvelope = await keyHandler.signTransaction({
      txnEnvelope,
      key,
    });
    return signedTxnEnvelope;
  }

  /**
   * Update the stored keys to be encrypted with the new password.
   *
   * @param oldPassword the user's old password
   * @param newPassword the user's new password
   */
  public async changePassword({
    oldPassword,
    newPassword,
  }: ChangePasswordArgs): Promise<KeyMetadata[]> {
    const oldKeys = await this.keyStore.loadAllKeys();
    const newKeys = await Promise.all(
      oldKeys.map(async (key: EncryptedKey) => {
        const encrypter = this.encrypterMap[key.encrypterName];
        const key2 = await encrypter.decryptKey({ key, password: oldPassword });
        return encrypter.encryptKey({ key: key2, password: newPassword });
      }),
    );
    const keys = await this.keyStore.storeKeys({ keys: newKeys });

    if (this.shouldCache) {
      keys.forEach((key: Key) => {
        this._writeToCache(key.publicKey, key);
      });
    }

    return keys;
  }

  private _readFromCache(publicKey: string): Key | undefined {
    if (!this.shouldCache) {
      return undefined;
    }

    return this.keyCache[publicKey];
  }

  private _writeToCache(publicKey: string, key: Key | undefined) {
    if (this.shouldCache && key) {
      this.keyCache[publicKey] = key;
    }
  }
}
