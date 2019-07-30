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
  public async storeKeys(
    encryptedKeys: Types.EncryptedKey[],
    utils: EncryptionUtils,
  );
  public async updateKeys(
    encryptedKeys: Types.EncryptedKey[],
    utils: EncryptionUtils,
  );
  public async loadAllKeyMetadata(utils: EncryptionUtils);
  public async loadAllKeys(utils: EncryptionUtils);
  public async loadKey(utils: EncryptionUtils);
  public async removeKey(publicKey: string, utils: EncryptionUtils);
}
```

## Reasoning

We shouldn't dictate how keystores should persist the keys. Instead, let's give
them the tools necessary to handle encryption. The wallet SDK does a great job
outlining how the should get to the key manager, but shouldn't do anything else
other than that.

## References

https://github.com/stellar/go/blob/master/services/keystore/spec.md
