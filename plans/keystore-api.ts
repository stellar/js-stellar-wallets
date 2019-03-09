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

interface IEncrypter {
  name: string;
  encryptKey({ key, password }: { key: IKey; password: string }): IEncryptedKey;
  decryptKey({ key, password }: { key: IEncryptedKey; password: string }): IKey;
}

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
  addKey({ key }: { key: IEncryptedKey }): void;
  getKey({ publicKey }: { publicKey: string }): IEncryptedKey;
  removeKey(publicKey: string): void;
  listKeys(): IKeyMetadata[];
}

interface IKeyTypeHandler {
  type: string;
  signTransaction({ txnEnvelope, key }: { txnEnvelope: any; key: IKey }): any;
}

interface IAddKeyInput {
  key: IKey;
  keyHandler: string;
  keyStore: string;
  encrypter: string;
  password?: string;
}

interface Module {
  registerKeyHandler(keyHandler: IKeyTypeHandler);
  registerKeyStore(keyStore: IKeyStore);
  registerEncrypter(encrypter: IEncrypter);

  addKey({ key, keyHandler, keyStore, encrypter }: IAddKeyInput): void;
  listKeys(keyStore: string): IKeyMetadata[];
  removeKey({
    publicKey,
    keyStore
  }: {
    publicKey: string;
    keyStore: string;
  }): void;
  signTransaction({
    txnEnvelope,
    publicKey,
    keyStore
  }: {
    txnEnvelope: any;
    publicKey: string;
    keyStore: string;
  }): any;
}

// addKey psuedocode
async function addKey({ key, keyHandler, keyStore, encrypter, password }: IAddKeyInput): void {
  const encrypterObj = encrypterMap[encrypter];
  const keyStoreObj = keyStoreMap[encrypter];
  const encryptedKey = encrypterObj.encryptKey({key, password});
  await keyStoreObj.addKey({key: encryptedKey});
}

// sign transaction psuedocode
  signTransaction({
    txnEnvelope,
    publicKey,
    keyStore
  }: {
    txnEnvelope: any;
    publicKey: string;
    keyStore: string;
  }): any;
