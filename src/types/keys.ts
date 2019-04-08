export interface KeyMetadata {
  type: string;
  encrypterName: string;
  publicKey: string;
  name?: string;
  path?: string;
  extra?: string;
  creationTime: number;
  modifiedTime: number;
}

export interface Key {
  type: string;
  publicKey: string;
  name?: string;
  secretKey?: string;
  path?: string;
  extra?: string;
}

export interface EncryptedKey {
  key: Key;
  encrypterName: string;
  salt: string;
}

interface EncryptKeyArgs {
  key: Key;
  password?: string;
}

interface DecryptKeyArgs {
  key: EncryptedKey;
  password?: string;
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
  encryptKey({ key, password }: EncryptKeyArgs): Promise<EncryptedKey>;
  decryptKey({ key, password }: DecryptKeyArgs): Promise<Key>;
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
  storeKeys({ keys }: { keys: EncryptedKey[] }): Promise<KeyMetadata[]>;

  /**
   *  load the key specified by this publicKey.
   *
   * @param publicKey specifies which key to load
   * @returns an encrypted key promise
   * @throws on any error
   */
  loadKey({ publicKey }: { publicKey: string }): Promise<EncryptedKey>;

  /**
   *  remove the key specified by this publicKey.
   *
   * @param publicKey specifies which key to remove
   * @returns void on success
   * @throws on any error
   */
  removeKey(publicKey: string): Promise<KeyMetadata>;

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
  txnEnvelope: any;
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
  name: string;
  signTransaction({
    txnEnvelope,
    key,
  }: HandlerSignTransactionArgs): Promise<any>;
}
