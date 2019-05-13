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
 *
 * ## `KeyManager`
 *
 * The `KeyManager` class is your primary gateway API for storing and securing
 * your users' Stellar keys. You should make an instance of this and call that
 * instance's functions whenever you need to CRUD keys for your users.
 *
 * Note that it does not generate keys, nor does it provide UI for accepting
 * it from a user. You'll have to add that functionality.
 *
 * `KeyManager` operates using a plugin system. You have to implement three
 * types of interfaces and add them to the `KeyManager`:
 *
 * - A `Encrypter` handles encrypting and decrypting a key.
 * - A `KeyStore` handles storing, updating, loading, and removing your keys
 * after they've been encrypted.
 * - A `KeyTypeHandler` encodes how to handle keytypes. For example, Ledger keys
 * sign transactions differently than raw Stellar secret seeds. Normally, you
 * won't have to write `KeyTypeHandler` interfaces; the SDK provides handlers for
 * these key types:
 *  - Ledgers
 *  - Plaintext secrets
 *
 * ## Names
 *
 * Each interface you pass to `KeyManager` will have a `name` property, which
 * should be unique to that particular interface and to the `KeyManager`. So if
 * you make an `Encrypter` named "YourUniqueEncrypter", we'll save all your
 * user's keys with that encrypter name, and we'll look for an `Encrypter` of
 * that name to decrypt those keys until the end of time!
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

    this._writeIndexCache(key.publicKey, key);

    return keyMetadata[0];
  }

  /**
   *  List information about stored keys
   *
   * @returns a list of metadata about all stored keys
   * @throws on any error
   */
  public loadAllKeyMetadata(): Promise<KeyMetadata[]> {
    return this.keyStore.loadAllKeyMetadata();
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
    this._writeIndexCache(publicKey, undefined);
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
      this._writeIndexCache(publicKey, key);
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

        this._writeIndexCache(encryptedKey.publicKey, decryptedKey);

        return encrypterName.encryptKey({
          key: decryptedKey,
          password: newPassword,
        });
      }),
    );

    return this.keyStore.updateKeys(newKeys);
  }

  private _readFromCache(publicKey: string): Key | undefined {
    if (!this.shouldCache) {
      return undefined;
    }

    return this.keyCache[publicKey];
  }

  private _writeIndexCache(publicKey: string, key: Key | undefined) {
    if (this.shouldCache && key) {
      this.keyCache[publicKey] = key;
    }
  }
}
