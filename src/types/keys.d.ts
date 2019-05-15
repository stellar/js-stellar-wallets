import { Transaction } from "stellar-base";
import { KeyType } from "../constants/keys";

export interface BaseKey {
  type: KeyType | string;
  publicKey: string;
  path?: string;
  extra?: any;
}

/**
 * All key types (ledgers, plaintext keys, etc.) should use the same Key shape.
 * That way, plugins don't have to know what key type there is, they just work
 * the same on all of them.
 *
 * `privateKey` is always required regardless of key types. If the key type
 * doesn't have any secrets (like a ledger key), this should be an empty string.
 *
 * `extra` is an arbitrary store of additional metadata, to be used as an escape
 * hatch to support any exotic key type in the future.
 */
export interface Key extends BaseKey {
  privateKey: string;
}

/**
 * The encrypted key is the exact same shape as the key, minus secret
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

export interface EncryptKeyParams {
  key: Key;
  password?: string;
}

export interface DecryptKeyParams {
  encryptedKey: EncryptedKey;
  password?: string;
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

  /**
   * Encrypt a raw, unencrypted key.
   */
  encryptKey(params: EncryptKeyParams): Promise<EncryptedKey>;

  /**
   * Decrypt an encrypted key. If the password doesn't properly encrypt the key,
   * it should throw an error. Please make sure the error message is descriptive
   * and user-friendly.
   */
  decryptKey(params: DecryptKeyParams): Promise<Key>;
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
   * Can be called repeatedly to update the KeyStore state when needed (for
   * example, when an authToken expires).
   */
  configure(data?: any): Promise<void>;

  /**
   * Store the given encrypted keys atomically.
   *
   * If any keys already exist in the store, this should throw an error object
   * with user-friendly text that lists the public keys that already exist.
   *
   * We have separate storeKeys and updateKeys functions so you don't
   * accidentally update non-existent keys or re-create a key you haven't
   * created yet.
   */
  storeKeys(encryptedKeys: EncryptedKey[]): Promise<KeyMetadata[]>;

  /**
   * Update the given encrypted keys atomically.
   *
   * If any keys don't exist in the store, this should throw an error object
   * with user-friendly text that lists the public keys that already exist.
   */
  updateKeys(keys: EncryptedKey[]): Promise<KeyMetadata[]>;

  /**
   *  Load the key specified by this publicKey.
   */
  loadKey(publicKey: string): Promise<EncryptedKey | undefined>;

  /**
   *  Remove the key specified by this publicKey.
   */
  removeKey(publicKey: string): Promise<KeyMetadata | undefined>;

  /**
   *  List information about stored keys.
   */
  loadAllKeyMetadata(): Promise<KeyMetadata[]>;

  /**
   *  Load all encrypted keys.
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
