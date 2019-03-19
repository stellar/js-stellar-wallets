interface IAddKeyArgs {
  key: IKey;
  encrypter: string;
  password?: string;
  shouldCache: boolean;
}

interface ISignTransactionArgs {
  txnEnvelope: any;
  publicKey: string;
  password?: string;
  shouldReadCache: boolean;
  shouldWriteCache: boolean;
}

interface IChangePasswordArgs {
  oldPassword: string;
  newPassword: string;
}

/**
 * KeyManager is the main class that is constructed to use the keystore API. It
 * optionally caches keys internally so a user doesn't have to re-decrypt
 * passwords so long as the KeyManager object is around in memory.
 *
 *  It requires the following to function:
 * - IKeyStore (passed into constructor)
 * - IKeyTypeHandler (one or more passed in via registerKeyHandler)
 * - IEncrypter (one or more passed in via registerEncrypter)
 */
class KeyManager {
  constructor({
    keyStore,
    shouldCache = true
  }: {
    keyStore: IKeyStore;
    shouldCache: boolean;
  }) {
    this.keyStore = keyStore;
    this.shouldCache = shouldCache;
  }

  registerKeyHandler(keyHandler: IKeyTypeHandler) {
    this.keyHandlerMap[keyHandler.name] = keyHandler;
  }

  registerEncrypter(encrypter: IEncrypter) {
    this.encrypterMap[encrypter.name] = encrypter;
  }

  /**
   *  stores a key in the keyStore after encrypting it with the encrypter.
   *
   * @param key key to store
   * @param password encrypt key with this as the secret
   * @param encrypter encryption algorithm to use (must have been registered)
   *
   * @returns void on success
   * @throws on any error
   */
  async storeKey({
    key,
    password,
    encrypter
  }: IAddKeyArgs): Promise<IKeyMetadata> {
    // happy path-only code to demonstrate idea
    const encrypterObj = this.encrypterMap[encrypter];
    const keyStoreObj = this.keyStore;
    const encryptedKey = encrypterObj.encryptKey({ key, password });
    const keyMetadata = await keyStoreObj.storeKeys({
      keys: [encryptedKey]
    })[0];
    // TODO: update cache here (if requested)
    return keyMetadata;
  }

  /**
   *  List information about stored keys
   *
   * @returns a list of metadata about all stored keys
   * @throws on any error
   */
  listKeys(): IKeyMetadata[] {
    return this.keyStore.listKeys();
  }

  /**
   *  remove the key specified by this publicKey.
   *
   * @param publicKey specifies which key to remove
   * @returns void on success
   * @throws on any error
   */
  async removeKey({ publicKey }: { publicKey: string }): Promise<IKeyMetadata> {
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
  async signTransaction({
    txnEnvelope,
    publicKey,
    password
  }: ISignTransactionArgs): Promise<any> {
    // TODO: read from cache
    const encryptedKey = await this.keyStore.loadKey({ publicKey });
    const encrypterObj = this.encrypterMap[encryptedKey.encrypterName];
    const key = encrypterObj.decryptKey({ key: encryptedKey, password });
    // TODO: write to cache
    const keyHandler = this.keyHandlerMap[key.type];
    const signedTxnEnvelope = keyHandler.signTransaction({ txnEnvelope, key });
    return signedTxnEnvelope;
  }

  /**
   * Update the stored keys to be encrypted with the new password.
   *
   * @param oldPassword the user's old password
   * @param newPassword the user's new password
   */
  async changePassword({
    oldPassword,
    newPassword
  }: IChangePasswordArgs): Promise<IKeyMetadata[]> {
    const oldKeys = await this.keyStore.loadAllKeys();
    const newKeys = oldKeys.map(key => {
      const encrypter = this.encrypterMap[key.encrypterName];
      const key2 = encrypter.decryptKey({ key, password: oldPassword });
      return encrypter.encryptKey({ key: key2, password: newPassword });
    });
    const res = await this.keyStore.storeKeys({ keys: newKeys });
    // TODO: write to cache
    return res;
  }

  private encrypterMap: { [key: string]: IEncrypter } = {};
  private keyStore: IKeyStore;
  private keyHandlerMap: { [key: string]: IKeyTypeHandler } = {};
  private keyCache: { [publicKey: string]: IKey };
  private shouldCache: boolean;
}

interface IKeyMetadata {
  type: string;
  encrypterName: string;
  publicKey: string;
  name?: string;
  path?: string;
  extra?: string;
  creationTime: Date;
  modifiedTime: Date;
}

interface IKey {
  type: string;
  publicKey: string;
  name?: string;
  secretKey?: string;
  path?: string;
  extra?: string;
}

interface IEncryptedKey {
  key: IKey;
  encrypterName: string;
  salt: string;
}

interface IEncryptKeyArgs {
  key: IKey;
  password?: string;
}

interface IDecryptKeyArgs {
  key: IEncryptedKey;
  password?: string;
}

/**
 * This is the interface that an encryption plugin must implement.
 *
 * example encrypters:
 *  - identity encrypter (does nothing, ok to use for Ledger / Trezor)
 *  - scrypt password + nacl box (what StellarX uses)
 *  - scrypt password and then xor with Stellar key (what Keybase does) https://keybase.io/docs/crypto/local-key-security
 */
interface IEncrypter {
  name: string;
  encryptKey({ key, password }: IEncryptKeyArgs): IEncryptedKey;
  decryptKey({ key, password }: IDecryptKeyArgs): IKey;
}

/**
 * This is the interface that a keystore plugin must implement.
 *
 * types of keystores:
 *   - authenticated server-side storage
 *   - storage on local device
 */
interface IKeyStore {
  name: string;

  /**
   * Initialize the keystore. Can be used to set up state like an authToken or
   * userid that is needed to properly access the key store for the logged-in
   * user.
   *
   * @param data any info needed to init the keystore
   * @returns void on success
   * @throws on any error
   */
  init(data?: any): void;

  /**
   * store the given encrypted keys, atomically if possible.
   *
   * @param keys already encrypted keys to add to store
   * @returns metadata about the keys once stored
   * @throws on any error
   */
  storeKeys({ keys }: { keys: IEncryptedKey[] }): Promise<IKeyMetadata[]>;

  /**
   *  load the key specified by this publicKey.
   *
   * @param publicKey specifies which key to load
   * @returns an encrypted key promise
   * @throws on any error
   */
  loadKey({ publicKey }: { publicKey: string }): Promise<IEncryptedKey>;

  /**
   *  remove the key specified by this publicKey.
   *
   * @param publicKey specifies which key to remove
   * @returns void on success
   * @throws on any error
   */
  removeKey(publicKey: string): Promise<IKeyMetadata>;

  /**
   *  List information about stored keys
   *
   * @returns a list of metadata about all stored keys
   * @throws on any error
   */
  listKeys(): IKeyMetadata[];

  /**
   *  Load all encrypted keys
   *
   * @returns a list of all stored keys
   * @throws on any error
   */
  loadAllKeys(): IEncryptedKey[];
}

/**
 * This is the interface that a key type plugin must implement.
 *
 * types of keys:
 *   - plaintext secret key (S...)
 *   - Ledger
 *   - Trezor
 */
interface IKeyTypeHandler {
  name: string;
  signTransaction({ txnEnvelope, key }: { txnEnvelope: any; key: IKey }): any;
}
