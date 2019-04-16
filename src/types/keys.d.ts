import { Transaction } from "stellar-base";
import { KeyType } from "../constants/keys";

export interface BaseKey {
  type: KeyType | string;
  publicKey: string;
  path?: string;
  extra?: any;
}

/**
 * There is one unencrypted key interface, which should work with all key types.
 * That way, plugins don't have to know what key type there is, they just work
 * the same on all of them.
 *
 * `privateKey` is required, but it should be an empty string if the key type
 * doesn't have any secrets (like a ledger key).
 *
 * `extra` is an arbitrary store of additional metadata, to be used for any and
 * all future exotic key types.
 */
export interface Key extends BaseKey {
  privateKey: string;
}

/**
 * The encrypted key is the exact same shape as the key, except minus secret
 * information and plus encrypted information.
 */
export interface EncryptedKey extends BaseKey {
  encryptedPrivateKey: string;
  encrypterName: string;
  salt: string;
}

/**
 * Metadata about the key and when it was changed.
 */
export interface KeyMetadata extends BaseKey {
  encrypterName: string;
  creationTime: number;
  modifiedTime: number;
}

/**
 * This is the export interface that an encryption plugin must implement.
 *
 * example encrypters:
 *  - identity encrypterName (does nothing, ok to use for Ledger / Trezor)
 *  - scrypt password + nacl box (what StellarX uses)
 *  - scrypt password and then xor with Stellar key (what Keybase does)
 * https://keybase.io/docs/crypto/local-key-security
 */
export interface Encrypter {
  name: string;
  encryptKey({
    key,
    password,
  }: {
    key: Key;
    password?: string;
  }): Promise<EncryptedKey>;
  decryptKey({
    encryptedKey,
    password,
  }: {
    encryptedKey: EncryptedKey;
    password?: string;
  }): Promise<Key>;
}

/**
 * This is the export interface that a keystore plugin must implement.
 *
 * types of keystores:
 *   - authenticated server-side storage
 *   - storage on local device
 */
export interface KeyStore {
  name: string;

  /**
   * Initialize the keystore. Can be used to set up state like an authToken or
   * userid that is needed to properly access the key store for the logged-in
   * user.
   *
   * Can be called repeatedly to update the KeyStore state when needed (say the
   * authToken expires)
   *
   * @param data any info needed to init the keystore
   * @returns void on success
   * @throws on any error
   */
  configure(data?: any): Promise<void>;

  /**
   * store the given encrypted keys, atomically if possible.
   *
   * @param keys already encrypted keys to add to store
   * @returns metadata about the keys once stored
   * @throws on any error
   */
  storeKeys(keys: EncryptedKey[]): Promise<KeyMetadata[]>;

  /**
   *  load the key specified by this publicKey.
   *
   * @param publicKey specifies which key to load
   * @returns an encrypted key promise, or null
   * @throws on any error
   */
  loadKey(publicKey: string): Promise<EncryptedKey | undefined>;

  /**
   *  remove the key specified by this publicKey.
   *
   * @param publicKey specifies which key to remove
   * @returns void on success
   * @throws on any error
   */
  removeKey(publicKey: string): Promise<KeyMetadata | undefined>;

  /**
   *  List information about stored keys
   *
   * @returns a list of metadata about all stored keys
   * @throws on any error
   */
  listKeys(): Promise<KeyMetadata[]>;

  /**
   *  Load all encrypted keys
   *
   * @returns a list of all stored keys
   * @throws on any error
   */
  loadAllKeys(): Promise<EncryptedKey[]>;
}

interface HandlerSignTransactionArgs {
  transaction: Transaction;
  key: Key;
}

/**
 * This is the export interface that a key type plugin must implement.
 *
 * types of keys:
 *   - plaintext secret key (S...)
 *   - Ledger
 *   - Trezor
 */
export interface KeyTypeHandler {
  keyType: KeyType;
  signTransaction({
    transaction,
    key,
  }: HandlerSignTransactionArgs): Promise<Transaction>;
}
