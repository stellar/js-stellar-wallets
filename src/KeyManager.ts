import { Transaction } from "stellar-base";

import { ledgerHandler } from "./keyTypeHandlers/ledger";
import { plaintextKeyHandler } from "./keyTypeHandlers/plaintextKey";

import { KeyType } from "./constants/keys";

import {
  EncryptedKey,
  Encrypter,
  Key,
  KeyMetadata,
  KeyStore,
  KeyTypeHandler,
} from "./types";

export interface KeyManagerParams {
  keyStore: KeyStore;
  shouldCache?: boolean;
}

export interface StoreKeyParams {
  key: Key;
  encrypterName: string;
  password?: string;
}

export interface SignTransactionParams {
  transaction: Transaction;
  publicKey: string;
  password?: string;
}

export interface ChangePasswordParams {
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
 * - Encrypter (one or more passed in via registerEncrypter)
 * - KeyTypeHandler (one or more passed in via registerKeyHandler. a ledger and
 * plaintext key handler are provided automatically.)
 */
export class KeyManager {
  private encrypterMap: { [key: string]: Encrypter };
  private keyStore: KeyStore;
  private keyHandlerMap: { [key: string]: KeyTypeHandler };
  private keyCache: { [publicKey: string]: Key };
  private shouldCache: boolean;

  constructor(params: KeyManagerParams) {
    this.encrypterMap = {};
    this.keyHandlerMap = {
      [KeyType.ledger]: ledgerHandler,
      [KeyType.plaintextKey]: plaintextKeyHandler,
    };

    this.keyCache = {};

    this.keyStore = params.keyStore;
    this.shouldCache = params.shouldCache || false;
  }

  public registerKeyHandler(keyHandler: KeyTypeHandler) {
    this.keyHandlerMap[keyHandler.keyType] = keyHandler;
  }

  public registerEncrypter(encrypter: Encrypter) {
    this.encrypterMap[encrypter.name] = encrypter;
  }

  /**
   * Stores a key in the keyStore after encrypting it with the encrypterName.
   *
   * @param key key to store
   * @param password encrypt key with this as the secret
   * @param encrypterName encryption algorithm to use (must have been registered)
   *
   * @returns The metadata of the key
   * @throws on any error
   */
  public async storeKey({
    key,
    password,
    encrypterName,
  }: StoreKeyParams): Promise<KeyMetadata> {
    // happy path-only code to demonstrate idea
    const encrypterObj = this.encrypterMap[encrypterName];
    const encryptedKey = await encrypterObj.encryptKey({ key, password });
    const keyMetadata = await this.keyStore.storeKeys([encryptedKey]);

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
   * @returns Metadata of the removed key
   * @throws on any error
   */
  public async removeKey(publicKey: string): Promise<KeyMetadata | undefined> {
    const res = await this.keyStore.removeKey(publicKey);
    this._writeToCache(publicKey, undefined);
    return res;
  }

  /**
   * Sign a transaction using the specified publicKey. Supports both using a
   * cached key and going out to the keystore to read and decrypt
   *
   * @param transaction Transaction object to sign
   * @param publicKey key to sign with
   * @returns signed transaction
   * @throws on any error, or if no key was found
   */
  public async signTransaction({
    transaction,
    publicKey,
    password,
  }: SignTransactionParams): Promise<Transaction> {
    let key = this._readFromCache(publicKey);

    if (!key) {
      const encryptedKey = await this.keyStore.loadKey(publicKey);

      if (!encryptedKey) {
        throw new Error("No key found");
      }

      const encrypterObj = this.encrypterMap[encryptedKey.encrypterName];
      key = await encrypterObj.decryptKey({ encryptedKey, password });
      this._writeToCache(publicKey, key);
    }

    const keyHandler = this.keyHandlerMap[key.type];
    const signedTransaction = await keyHandler.signTransaction({
      transaction,
      key,
    });
    return signedTransaction;
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
  }: ChangePasswordParams): Promise<KeyMetadata[]> {
    const oldKeys = await this.keyStore.loadAllKeys();
    const newKeys = await Promise.all(
      oldKeys.map(async (encryptedKey: EncryptedKey) => {
        const encrypterName = this.encrypterMap[encryptedKey.encrypterName];
        const decryptedKey = await encrypterName.decryptKey({
          encryptedKey,
          password: oldPassword,
        });

        this._writeToCache(encryptedKey.publicKey, decryptedKey);

        return encrypterName.encryptKey({
          key: decryptedKey,
          password: newPassword,
        });
      }),
    );

    return this.keyStore.storeKeys(newKeys);
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
