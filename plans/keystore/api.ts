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
 * KeyManager is the main class that is constructed to use the keystore API. It requires the following to function:
 * - IKeyStore (passed into constructor)
 * - IKeyTypeHandler (one or more passed in via registerKeyHandler)
 * - IEncrypter (one or more passed in via registerEncrypter)
 */
class KeyManager {
  constructor(keyStore: IKeyStore) {
    this.keyStore = keyStore;
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
    encrypter,
    shouldCache = true
  }: IAddKeyArgs): Promise<IKeyMetadata> {
    // happy path-only code to demonstrate idea
    const encrypterObj = this.encrypterMap[encrypter];
    const keyStoreObj = this.keyStore;
    const encryptedKey = encrypterObj.encryptKey({ key, password });
    const keyMetadata = await keyStoreObj.storeKey({ key: encryptedKey });
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
    password,
    shouldReadCache = true,
    shouldWriteCache = true
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

  changePassword({ oldPassword, newPassword }: IChangePasswordArgs) {
    // TODO: rework this so password change handling goes to both the encrypter
    // and the key store
    if (typeof this.keyStore.handlePasswordChange === "function") {
      return this.keyStore.handlePasswordChange({});
    }
  }

  private encrypterMap: { [key: string]: IEncrypter } = {};
  private keyStore: IKeyStore;
  private keyHandlerMap: { [key: string]: IKeyTypeHandler } = {};
  private keyCache: { [publicKey: string]: IKey };
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
  encryptKey({
    key,
    password
  }: {
    key: IKey;
    password?: string;
  }): IEncryptedKey;
  decryptKey({
    key,
    password
  }: {
    key: IEncryptedKey;
    password?: string;
  }): IKey;
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
   * store the given encrypted key.
   *
   * @param key already encrypted key to add to store
   * @returns void on success
   * @throws on any error
   */
  storeKey({ key }: { key: IEncryptedKey }): Promise<IKeyMetadata>;

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

  /**
   * (optional) handle password change in the keystore.
   *
   * The most basic approach to password change is to loadAllKeys(), decrypt &
   * reencrypt them, and storeKey() them all back to the server. This works but
   * is not atomic. Keybase specified an approach where a delta is uploaded to
   * the server on password change, which avoids the need to re-encrypt and can
   * be done atomically. This method is provided to allow schemes such as the
   * keybase approach: https://keybase.io/docs/crypto/local-key-security
   *
   * @param data a data object needed by the keystore to handle a password change.
   */
  handlePasswordChange?(data: { [key: string]: any }): void;
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
