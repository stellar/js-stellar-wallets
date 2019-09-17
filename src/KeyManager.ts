import sha1 from "js-sha1";
import { Networks, Transaction } from "stellar-sdk";

import { ledgerHandler } from "./keyTypeHandlers/ledger";
import { plaintextKeyHandler } from "./keyTypeHandlers/plaintextKey";

import { KeyType } from "./constants/keys";

import {
  AuthToken,
  EncryptedKey,
  Encrypter,
  GetAuthTokenParams,
  Key,
  KeyMetadata,
  KeyStore,
  KeyTypeHandler,
  UnstoredKey,
} from "./types";

export interface KeyManagerParams {
  keyStore: KeyStore;
  defaultNetworkPassphrase?: string;
  shouldCache?: boolean;
}

export interface StoreKeyParams {
  key: Key | UnstoredKey;
  encrypterName: string;
  password?: string;
}

export interface SignTransactionParams {
  transaction: Transaction;
  id: string;
  password?: string;
}

export interface ChangePasswordParams {
  oldPassword: string;
  newPassword: string;
}

/**
 * The `KeyManager` class is your primary gateway API for encrypting and storing
 * your users' Stellar keys. Make an instance of this and use that
 * instance to create, read, update, and delete secret keys.
 *
 * Note that at this time, `KeyManager` does not generate keys, nor does it
 * provide UI for accepting it from a user. You're app will have to implement
 * those features and pass the resulting keys to this class.
 *
 * `KeyManager` employs a plugin system. You may implement three types of
 * interfaces and add them to the `KeyManager` (or use our reference
 * plugins):
 *
 * - A `Encrypter` handles encrypting and decrypting a key.
 * - A `KeyStore` handles storing, updating, loading, and removing your keys
 * after they've been encrypted.
 * - (optional) A `KeyTypeHandler` encodes how to handle keytypes. For example,
 * Ledger keys sign transactions differently than raw Stellar secret seeds.
 *
 * Normally, you won't have to write `KeyTypeHandler` interfaces; the SDK
 * provides handlers for these key types:
 *
 *  - Ledgers
 *  - Plaintext secrets
 *
 * ### Plugin names
 *
 * Each plugin you pass to `KeyManager` will have a `name` property, which
 * should be unique to that particular interface and to the `KeyManager`. So if
 * you make an `Encrypter` named "YourUniqueEncrypter", we'll save all your
 * user's keys with that encrypter name, and we'll look for an `Encrypter` of
 * that name to decrypt those keys until the end of time!
 */
export class KeyManager {
  private encrypterMap: { [key: string]: Encrypter };
  private keyStore: KeyStore;
  private keyHandlerMap: { [key: string]: KeyTypeHandler };
  private keyCache: { [id: string]: Key };
  private shouldCache: boolean;
  private defaultNetworkPassphrase: string;

  constructor(params: KeyManagerParams) {
    this.encrypterMap = {};
    this.keyHandlerMap = {
      [KeyType.ledger]: ledgerHandler,
      [KeyType.plaintextKey]: plaintextKeyHandler,
    };

    this.keyCache = {};

    this.keyStore = params.keyStore;
    this.shouldCache = params.shouldCache || false;

    this.defaultNetworkPassphrase =
      params.defaultNetworkPassphrase || Networks.PUBLIC;
  }

  /**
   * Register a KeyTypeHandler for a given key type.
   * @param {KeyTypeHandler} keyHandler
   */
  public registerKeyHandler(keyHandler: KeyTypeHandler) {
    this.keyHandlerMap[keyHandler.keyType] = keyHandler;
  }

  /**
   * Register a new encrypter.
   * @param {Encrypter} encrypter
   */
  public registerEncrypter(encrypter: Encrypter) {
    this.encrypterMap[encrypter.name] = encrypter;
  }

  /**
   * Stores a key in the keyStore after encrypting it with the encrypterName.
   *
   * @async
   * @param key key to store
   * @param password encrypt key with this as the secret
   * @param encrypterName encryption algorithm to use (must have been
   * registered)
   *
   * @returns The metadata of the key
   */
  public async storeKey({
    key,
    password,
    encrypterName,
  }: StoreKeyParams): Promise<KeyMetadata> {
    const id = key.id || sha1(`${key.privateKey}${key.publicKey}`);

    const newKey: Key = {
      ...key,
      id,
    };

    const encrypter = this.encrypterMap[encrypterName];
    const encryptedKey = await encrypter.encryptKey({
      key: newKey,
      password,
    });
    const keyMetadata = await this.keyStore.storeKeys([encryptedKey]);

    this._writeIndexCache(newKey.id, newKey);

    return keyMetadata[0];
  }

  /**
   *  List information about stored keys
   *
   * @returns a list of all stored keys
   */
  public async loadAllKeys(password?: string): Promise<any[]> {
    const encryptedKeys: EncryptedKey[] = await this.keyStore.loadAllKeys();
    const keys = [];

    while (encryptedKeys.length) {
      const encryptedKey = encryptedKeys.shift() as EncryptedKey;
      const encrypter = this.encrypterMap[encryptedKey.encrypterName];
      const key = await encrypter.decryptKey({
        encryptedKey,
        password,
      });

      keys.push(key);
    }

    return keys;
  }

  /**
   *  Remove the key specified by this publicKey.
   *
   * @async
   * @param id Specifies which key to remove.
   *                     The id is computed as `sha1(private key + public key)`.
   * @returns Metadata of the removed key
   */
  public async removeKey(id: string): Promise<KeyMetadata | undefined> {
    const res = await this.keyStore.removeKey(id);
    this._writeIndexCache(id, undefined);
    return res;
  }

  /**
   * Sign a transaction using the specified publicKey. Supports both using a
   * cached key and going out to the keystore to read and decrypt
   *
   * @async
   * @param {Transaction} transaction Transaction object to sign
   * @param {string} id Key to sign with. The id is computed as
   *                    `sha1(private key + public key)`.
   * @returns Signed transaction
   */
  public async signTransaction({
    transaction,
    id,
    password,
  }: SignTransactionParams): Promise<Transaction> {
    let key = this._readFromCache(id);

    if (!key) {
      const encryptedKey = await this.keyStore.loadKey(id);

      if (!encryptedKey) {
        throw new Error("No key found");
      }

      const encrypter = this.encrypterMap[encryptedKey.encrypterName];
      key = await encrypter.decryptKey({ encryptedKey, password });
      this._writeIndexCache(id, key);
    }

    const keyHandler = this.keyHandlerMap[key.type];
    const signedTransaction = await keyHandler.signTransaction({
      transaction,
      key,
    });
    return signedTransaction;
  }

  // tslint:disable max-line-length
  /**
   * Request an auth token from auth server, which can be used to deposit and
   * withdraw auth-required tokens.
   *
   * Under the hood, it fetches a transaction from the auth server, signs that
   * transaction with the user's key, and returns that transaction for a JWT.
   *
   * https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0010.md
   *
   * @async
   * @param {object} params Params object
   * @param {string} params.id The user's key to authenticate. The id is
   *                           computed as `sha1(private key + public key)`.
   * @param {string} params.password The password that will decrypt that secret
   * @param {string} params.authServer The URL of the authentication server
   * @returns {Promise<string>} authToken JWT
   */
  // tslint:enable max-line-length
  public async getAuthToken({
    id,
    password,
    authServer,
  }: GetAuthTokenParams): Promise<AuthToken> {
    // throw errors for missing params
    if (!id) {
      throw new Error("Required parameter `id` is missing!");
    }
    if (!password) {
      throw new Error("Required parameter `password` is missing!");
    }
    if (!authServer) {
      throw new Error("Required parameter `authServer` is missing!");
    }

    let key = this._readFromCache(id);

    if (!key) {
      const encryptedKey = await this.keyStore.loadKey(id);

      if (!encryptedKey) {
        throw new Error("No key found");
      }

      const encrypter = this.encrypterMap[encryptedKey.encrypterName];
      key = await encrypter.decryptKey({ encryptedKey, password });
      this._writeIndexCache(id, key);
    }

    const challengeRes = await fetch(
      `${authServer}?account=${encodeURIComponent(key.publicKey)}`,
    );

    const keyNetwork = key.network || this.defaultNetworkPassphrase;

    const {
      transaction,
      network_passphrase,
      error,
    } = await challengeRes.json();

    if (error) {
      throw new Error(error);
    }

    // Throw error when network_passphrase is returned, and doesn't match
    if (network_passphrase !== undefined && keyNetwork !== network_passphrase) {
      throw new Error(
        `
        Network mismatch: the transfer server expects "${network_passphrase}", 
        but you're using "${keyNetwork}"
        `,
      );
    }

    const keyHandler = this.keyHandlerMap[key.type];

    const signedTransaction = await keyHandler.signTransaction({
      transaction: new Transaction(transaction, keyNetwork),
      key,
    });

    const signedTransactionXDR: string = signedTransaction
      .toEnvelope()
      .toXDR()
      .toString("base64");

    const responseRes = await fetch(authServer, {
      method: "POST",
      body: JSON.stringify({
        transaction: signedTransactionXDR,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const { token } = await responseRes.json();

    return token;
  }

  /**
   * Update the stored keys to be encrypted with the new password.
   *
   * @async
   * @param oldPassword the user's old password
   * @param newPassword the user's new password
   * @returns {Promise<KeyMetadata[]>}
   */
  public async changePassword({
    oldPassword,
    newPassword,
  }: ChangePasswordParams): Promise<KeyMetadata[]> {
    const oldKeys = await this.keyStore.loadAllKeys();
    const newKeys = await Promise.all(
      oldKeys.map(async (encryptedKey: EncryptedKey) => {
        const encrypter = this.encrypterMap[encryptedKey.encrypterName];
        const decryptedKey = await encrypter.decryptKey({
          encryptedKey,
          password: oldPassword,
        });

        this._writeIndexCache(decryptedKey.id, decryptedKey);

        return encrypter.encryptKey({
          key: decryptedKey,
          password: newPassword,
        });
      }),
    );

    return this.keyStore.updateKeys(newKeys);
  }

  private _readFromCache(id: string): Key | undefined {
    if (!this.shouldCache) {
      return undefined;
    }

    return this.keyCache[id];
  }

  private _writeIndexCache(id: string, key: Key | undefined) {
    if (this.shouldCache && key) {
      this.keyCache[id] = key;
    }
  }
}
