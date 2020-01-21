import StellarSdk, { Transaction } from "stellar-sdk";

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
  password: string;
}

export interface SignTransactionParams {
  transaction: Transaction;
  id: string;
  password: string;
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
      params.defaultNetworkPassphrase || StellarSdk.Networks.PUBLIC;
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
   * Set the default network passphrase
   * @param {string} defaultNetworkPassphrase
   */
  public setDefaultNetworkPassphrase(passphrase: string) {
    this.defaultNetworkPassphrase = passphrase;
  }

  /**
   * Stores a key in the keyStore after encrypting it with the encrypterName.
   *
   * @async
   * @param key Key object to store. an `id` field is optional; if you don't
   * provide one, we'll generate a random number. The id will be used to read,
   * change, update, and delete keys.
   * @param password encrypt key with this as the secret
   * @param encrypterName encryption algorithm to use (must have been
   * registered)
   *
   * @returns The metadata of the key
   */
  public async storeKey(params: StoreKeyParams): Promise<KeyMetadata> {
    const { key, password, encrypterName } = params;
    const id = key.id || `${Math.random()}`;

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
   *  Load and decrypt one key, given its id.
   *
   * @returns Decrypted key
   */
  public async loadKey(id: string, password: string): Promise<Key> {
    const encryptedKeys: EncryptedKey[] = await this.keyStore.loadAllKeys();
    const keys = encryptedKeys.filter((k) => k.id === id);

    if (!keys.length) {
      throw new Error(`Key not found with id '${id}'.`);
    }

    if (keys.length > 1) {
      throw new Error(
        `Too many keys found with id '${id}', that’s not supposed to happen!`,
      );
    }

    const encryptedKey = keys[0];
    const encrypter = this.encrypterMap[encryptedKey.encrypterName];

    let key;

    try {
      key = await encrypter.decryptKey({
        encryptedKey,
        password,
      });
    } catch (e) {
      throw new Error(
        `Couldn’t decrypt key '${id}' with the supplied password.`,
      );
    }

    return key;
  }

  /**
   *  Get a list of all stored key ids.
   *
   * @returns List of ids
   */
  public async loadAllKeyIds(): Promise<string[]> {
    const encryptedKeys: EncryptedKey[] = await this.keyStore.loadAllKeys();
    return encryptedKeys.map((key) => key.id);
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
  public async signTransaction(
    params: SignTransactionParams,
  ): Promise<Transaction> {
    const { transaction, id, password } = params;
    let key = this._readFromCache(id);

    if (!key) {
      const encryptedKey = await this.keyStore.loadKey(id);

      if (!encryptedKey) {
        throw new Error(
          `Couldn't sign the transaction: no key with id '${id}' found.`,
        );
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
  public async fetchAuthToken(params: GetAuthTokenParams): Promise<AuthToken> {
    const { id, password, authServer } = params;
    // throw errors for missing params
    if (id === undefined) {
      throw new Error("Required parameter `id` is missing!");
    }
    if (password === undefined) {
      throw new Error("Required parameter `password` is missing!");
    }
    if (!authServer) {
      throw new Error("Required parameter `authServer` is missing!");
    }

    let key = this._readFromCache(id);

    if (!key) {
      const encryptedKey = await this.keyStore.loadKey(id);

      if (!encryptedKey) {
        throw new Error(
          `Couldn't fetch an auth token: no key with id '${id}' found.`,
        );
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

    const firstTransaction = new Transaction(transaction, keyNetwork);

    const signedTransaction = await keyHandler.signTransaction({
      transaction: firstTransaction,
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

    const { token, message, status } = await responseRes.json();

    // if we get a false status message, error out
    if (status === false && message) {
      throw new Error(message);
    }

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
  public async changePassword(
    params: ChangePasswordParams,
  ): Promise<KeyMetadata[]> {
    const { oldPassword, newPassword } = params;
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
