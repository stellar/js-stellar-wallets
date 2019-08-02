# Data Privacy

## Overview

In order to increase privacy on the data stored, the key manager will encrypt
all data before passing it to the keystore.

The most notable change related to the wallet SDK's API is that keystores won't
receive the public key anymore; only a `sha1(privateKey + publicKey)` digest
will be available to operate search actions, like removing a key.

## Data format

```ts
export interface EncryptingParams {
  type: KeyType | string;
  publicKey: string;
  privateKey: string;
  path?: string;
  extra?: any;
}

export interface EncryptedKey {
  id: string;
  encryptedBlob: string;
  salt: string;
  encrypterName: string;
  creationTime?: number;
  modifiedTime?: number;
}

export interface Key {
  type: KeyType | string;
  publicKey: string;
  privateKey: string;
  path?: string;
  extra?: any;
  id: string;
  creationTime?: number;
  modifiedTime?: number;
}
```

The keystore and keymanager will receive the `id` from now on, allowing
operations on a single key (e.g. removing a key).

```ts
export interface Encrypter {
  name: string;
  encrypt(params: EncryptingParams): Promise<EncryptedKey>;
  decrypt(params: EncryptedKey): Promise<Key>;
}

export interface KeyStore {
  // ...

  loadKey(id: string): Promise<EncryptedKey | undefined>;
  removeKey(id: string): Promise<KeyMetadata | undefined>;
}

export class KeyManager {
  // ...

  removeKey(id: string): Promise<KeyMetadata | undefined>;
}
```

## Integration with keystore.stellar.org

In order to integrate with keystore.stellar.org, a few changes would be required
to accomodate the SDK's separation of concerns. Right now, the keystore can't
perform any encryption operations, encrypting the whole keys blob.

```ts
interface EncryptingData {
  publicKey: string;
  privateKey: string;
}

interface RawKeyData {
  keyType: string;
  publicKey: string;
  privateKey: string;
  path?: string;
  extra?: any;
}

interface EncryptedKeysData {
  keysBlob: string;
  creationTime: number;
  modifiedTime: number;
}

encryptedBlob = base64(json(EncryptingData))
keysBlob = base64url(json(RawKeyData[]))
```

## Considerations

With this new encryption format, it's not possible to simple load all keys
metadata and list your Stellar accounts in read-only mode until you're actually
required to load the private key (e.g. signing transactions). Wallets that want
to defer the passphrase request (e.g. asking the user for the encryption
passphrase) will have to store the public keys themselves.

Changing how keystore.stellar.org works is also suboptimal. Unfortunately,
unless we change how the SDK works in more deep ways (e.g. passing encryption
utilities from the keymanager to the keystore), we can't comply to the current
API.

## References

https://github.com/stellar/go/blob/master/services/keystore/spec.md
