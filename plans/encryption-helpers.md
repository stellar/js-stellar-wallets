# Encryption helpers

## Overview

Key stores may need to further encrypt/decrypt content using the same passphrase
provided to the keymanager. This is exactly the case with
<https://keystore.stellar.org>'s spec. Unfortunately, keystores don't have
access to either the key manager instance or the passphrase itself, nor the
functions used to encrypt/decrypt strings.

To keep the keystore API simple, we may provide two utility functions for
encrypting/decrypting strings that doesn't require any knowledge about the
passphrase.

## Basic API

Right now, any calls to the keystore will either receive the encrypted key
payload (like `keystore.storeKeys(encryptedKeys)`, or no arguments at all (like
`keystore#loadAllKeys()`. The proposed solution is introducing an additional
parameter that contains the utility functions.

```ts
import { Types } from "@stellar/wallet-sdk";

interface EncryptionUtils {
  encrypt(content: string): string;
  decrypt(content: string, salt: string): string;
}

class KeyStore implements Types.KeyStore {
  public storeKeys(
    encryptedKeys: Types.EncryptedKey[],
    utils: EncryptionUtils,
  ): Promise<KeysMetadata>;

  public updateKeys(
    encryptedKeys: Types.EncryptedKey[],
    utils: EncryptionUtils,
  ): Promise<KeysMetadata>;

  public loadAllKeyMetadata(utils: EncryptionUtils): Promise<KeysMetadata>;
  public loadAllKeys(utils: EncryptionUtils): Promise<EncryptedKeys>;
  public loadKey(utils: EncryptionUtils): Promise<EncryptedKey>;

  public removeKey(
    publicKey: string,
    utils: EncryptionUtils,
  ): Promise<KeyMetadata>;
}
```

To enable the definition of encryption helpers, we need to change the encrypter
plugin's API. Instead of tightly coupling it to private keys encryption, let's
move to a more generic API, like the following:

```ts
export interface EncryptParams {
  content: string;
  password?: string;
}

export interface DecryptParams {
  content: string;
  password?: string;
  salt?: string;
}

export interface EncryptedData {
  content: string;
  encrypterName: string;
  salt?: string;
}

export interface DecryptedData {
  content: string;
}

export interface Encrypter {
  name: string;

  encrypt(params: EncryptParams): Promise<EncryptedData>;
  decrypt(params: DecryptParams): Promise<DecryptedData>;
}
```

With this new API, we'll have to introduce a generic class for bridge the
conversion between `EncryptedData`/`DecryptedData` to `EncryptedKey`/`Key` and
vice-versa.

```ts
export interface KeyEncrypter {
  encryptKey(params: EncryptKeyParams): Promise<EncryptedKey>;
  decryptKey(params: DecryptKeyParams): Promise<Key>;
}
```

## Reasoning

We shouldn't dictate how keystores should persist the keys. Instead, let's give
them the tools necessary to handle encryption. The wallet SDK does a great job
outlining how the should get to the key manager, but shouldn't do anything else
other than that.

## References

https://github.com/stellar/go/blob/master/services/keystore/spec.md
