interface IKeyMetadata {
  type: string;
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

// types of encrypters:
// - identity encrypter (does nothing, ok to use for Ledger / Trezor)
// - scrypt password + nacl box (what StellarX uses)
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

// types of keystores:
// - authenticated server-side storage
// - storage on local device
interface IKeyStore {
  name: string;
  /**
   *
   * @param authToken passed as an opaque string to the KeyStore, which can use
   * it to authenticate with a storage server or other system if needed.
   */
  init({ authToken }: { authToken: string }): void;
  /**
   *
   * @param key key to add to store
   */
  setKey({ key }: { key: IEncryptedKey }): void;
  getKey({ publicKey }: { publicKey: string }): IEncryptedKey;
  removeKey(publicKey: string): void;
  listKeys(): IKeyMetadata[];
}

// types of keys:
// - plaintext secret key (S...)
// - Trezor / Ledger
interface IKeyTypeHandler {
  type: string;
  signTransaction({ txnEnvelope, key }: { txnEnvelope: any; key: IKey }): any;
}

interface IAddKeyArgs {
  key: IKey;
  keyHandler: string;
  keyStore: string;
  encrypter: string;
  password?: string;
}

interface ISignTransactionArgs {
  txnEnvelope: any;
  publicKey: string;
  encrypter: string;
  keyStore: string;
  password?: string;
}

interface Module {
  registerKeyHandler(keyHandler: IKeyTypeHandler);
  registerKeyStore(keyStore: IKeyStore);
  registerEncrypter(encrypter: IEncrypter);

  setKey({ key, keyHandler, keyStore, encrypter }: IAddKeyArgs): void;
  listKeys(keyStore: string): IKeyMetadata[];
  removeKey({ publicKey, keyStore }: { publicKey: string; keyStore: string });
  signTransaction({ txnEnvelope, publicKey, keyStore }: ISignTransactionArgs);
}

const encrypterMap: { [key: string]: IEncrypter } = {};
const keyStoreMap: { [key: string]: IKeyStore } = {};
const keyHandlers: { [key: string]: IKeyTypeHandler } = {};

// Module.setKey psuedocode
async function setKey({
  key,
  keyHandler,
  keyStore,
  encrypter,
  password
}: IAddKeyArgs) {
  const encrypterObj = encrypterMap[encrypter];
  const keyStoreObj = keyStoreMap[encrypter];
  const encryptedKey = encrypterObj.encryptKey({ key, password });
  await keyStoreObj.setKey({ key: encryptedKey });
}

// Module.signTransaction pseudocode
async function signTransaction({
  txnEnvelope,
  publicKey,
  keyStore,
  encrypter,
  password
}: ISignTransactionArgs) {
  const keyStoreObj = keyStoreMap[keyStore];
  const encrypterObj = encrypterMap[encrypter];
  const encryptedKey = keyStoreObj.getKey({ publicKey });
  const key = encrypterObj.decryptKey({ key: encryptedKey, password });
  const keyHandler = keyHandlers[key.type];
  const signedTxnEnvelope = keyHandler.signTransaction({ txnEnvelope, key });
  return signedTxnEnvelope;
}
