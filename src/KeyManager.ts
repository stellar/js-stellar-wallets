interface KeyManagerParams {
  keyStore: KeyStore;
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
  private keyCache: { [publicKey: string]: Key };
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
   * @returns void on success
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
    // TODO update cache here
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
    // TODO: read from cache
    const encryptedKey = await this.keyStore.loadKey({ publicKey });
    const encrypterObj = this.encrypterMap[encryptedKey.encrypterName];
    const key = await encrypterObj.decryptKey({ key: encryptedKey, password });
    // TODO: write to cache
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
      oldKeys.map(async (key) => {
        const encrypter = this.encrypterMap[key.encrypterName];
        const key2 = await encrypter.decryptKey({ key, password: oldPassword });
        return encrypter.encryptKey({ key: key2, password: newPassword });
      }),
    );
    const res = await this.keyStore.storeKeys({ keys: newKeys });
    // TODO: write to cache
    return res;
  }
}

interface KeyMetadata {
  type: string;
  encrypterName: string;
  publicKey: string;
  name?: string;
  path?: string;
  extra?: string;
  creationTime: Date;
  modifiedTime: Date;
}

interface Key {
  type: string;
  publicKey: string;
  name?: string;
  secretKey?: string;
  path?: string;
  extra?: string;
}

interface EncryptedKey {
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
 * This is the interface that an encryption plugin must implement.
 *
 * example encrypters:
 *  - identity encrypter (does nothing, ok to use for Ledger / Trezor)
 *  - scrypt password + nacl box (what StellarX uses)
 *  - scrypt password and then xor with Stellar key (what Keybase does)
 * https://keybase.io/docs/crypto/local-key-security
 */
interface Encrypter {
  name: string;
  encryptKey({ key, password }: EncryptKeyArgs): Promise<EncryptedKey>;
  decryptKey({ key, password }: DecryptKeyArgs): Promise<Key>;
}

/**
 * This is the interface that a keystore plugin must implement.
 *
 * types of keystores:
 *   - authenticated server-side storage
 *   - storage on local device
 */
interface KeyStore {
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
 * This is the interface that a key type plugin must implement.
 *
 * types of keys:
 *   - plaintext secret key (S...)
 *   - Ledger
 *   - Trezor
 */
interface KeyTypeHandler {
  name: string;
  signTransaction({
    txnEnvelope,
    key,
  }: HandlerSignTransactionArgs): Promise<any>;
}
