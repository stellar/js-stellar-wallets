import { Transaction } from "stellar-base";

export enum KeyType {
  ledger = "ledger",
  plaintextKey = "plaintextKey",
}

interface BaseKey {
  publicKey: string;
  extra?: string;
}

export interface LedgerKey extends BaseKey {
  type: KeyType;
  path: string;
}

export interface PlainTextKey extends BaseKey {
  type: KeyType;
  privateKey: string;
}

/**
 * The whole, unencrypted blob. Should be enough information to sign a
 * key alone, or with a library that reaches out to a hardware device.
 * The "extra" property is for miscellaneous notes about the key.
 */
export type Key = LedgerKey | PlainTextKey;

/**
 * Metadata about the key, without any private information.
 */
export interface KeyMetadata extends BaseKey {
  type: KeyType;
  encrypterName: string;
  path?: string;
  creationTime: number;
  modifiedTime: number;
}

/**
 * Metadata about the key, without any private information.
 */
export interface EncryptedKey {
  key: Key;
  encrypterName: string;
  salt: string;
}

/**
 * This is the export interface that an encryption plugin must implement.
 *
 * example encrypters:
 *  - identity encrypter (does nothing, ok to use for Ledger / Trezor)
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
    key,
    password,
  }: {
    key: EncryptedKey;
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
