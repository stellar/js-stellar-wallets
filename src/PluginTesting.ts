import StellarSdk from "stellar-sdk";

import { KeyType } from "./constants/keys";
import { generateEncryptedKey } from "./fixtures/keys";
import { getKeyMetadata } from "./KeyHelpers";
import { EncryptedKey, Encrypter, Key, KeyMetadata, KeyStore } from "./types";

function isKey(obj: any): obj is Key {
  return obj.privateKey !== undefined;
}

function isEncryptedKey(obj: any): obj is EncryptedKey {
  return obj.encryptedPrivateKey !== undefined;
}

/**
 * Validates an `Encrypter` object. Resolves to true if valid.
 */
export async function testEncrypter(encrypter: any = 0): Promise<boolean> {
  const account = StellarSdk.Keypair.random();

  if (!encrypter) {
    return Promise.reject(new Error("[Encrypter] Encrypter not defined"));
  }

  if (typeof encrypter.name !== "string") {
    return Promise.reject(new Error("[Encrypter.name] Name not defined"));
  }

  if (typeof encrypter.encryptKey !== "function") {
    return Promise.reject(
      new Error("[Encrypter.encryptKey] Function not found"),
    );
  }

  if (typeof encrypter.decryptKey !== "function") {
    return Promise.reject(
      new Error("[Encrypter.decryptKey] Function not found"),
    );
  }

  const key = {
    type: KeyType.plaintextKey,
    publicKey: account.publicKey(),
    privateKey: account.secret(),
  };

  const password = "kh2fu0b939uvdkj";

  const encryptedKey = await (encrypter as Encrypter).encryptKey({
    key,
    password,
  });

  if (!isEncryptedKey(encryptedKey)) {
    return Promise.reject(
      new Error("[Encrypter.encryptKey] Encrypted key not valid"),
    );
  }

  const decryptedKey = await (encrypter as Encrypter).decryptKey({
    encryptedKey,
    password,
  });

  if (!isKey(decryptedKey)) {
    return Promise.reject(
      new Error("[Encrypter.decryptKey] Decrypted key not valid"),
    );
  }

  if (decryptedKey.privateKey !== key.privateKey) {
    return Promise.reject(
      new Error(
        "[Encrypter.decryptKey] Decrypted key doesn't match original key",
      ),
    );
  }

  return Promise.resolve(true);
}

/**
 * Validates a `KeyStore` object. Resolves to true if valid.
 */
export async function testKeyStore(
  keyStoreCandidate: any = null,
): Promise<boolean> {
  if (!keyStoreCandidate) {
    return Promise.reject(new Error("[KeyStore] KeyStore not defined"));
  }

  if (!keyStoreCandidate.name) {
    return Promise.reject(new Error("[KeyStore.name] Name not defined"));
  }

  const functions = [
    "configure",
    "storeKeys",
    "updateKeys",
    "loadKey",
    "removeKey",
    "loadAllKeyMetadata",
    "loadAllKeys",
  ];

  for (const functionName of functions) {
    if (typeof keyStoreCandidate[functionName] !== "function") {
      return Promise.reject(
        new Error(`[KeyStore.${functionName}] Invalid function`),
      );
    }
  }

  const keyStore: KeyStore = keyStoreCandidate as KeyStore;

  const encryptedKey: EncryptedKey = generateEncryptedKey(keyStore.name);

  const keyMetadata: KeyMetadata = getKeyMetadata({
    encryptedKey,
    creationTime: 0,
    modifiedTime: 0,
  });

  // make sure we can't update a key that doesn't exist
  try {
    keyStore.updateKeys([encryptedKey]);

    return Promise.reject(
      new Error(
        "[KeyStore.updateKeys] Doesn't error when updating a nonexistent key",
      ),
    );
  } catch (e) {
    // good!
  }

  // KeyStore.storeKeys
  const testMetadata = await keyStore.storeKeys([encryptedKey]);

  if (keyMetadata.publicKey !== testMetadata[0].publicKey) {
    console.log(
      "expected metadata: ",
      keyMetadata.publicKey,
      "and test stored shit got back: ",
      testMetadata[0],
    );
    return Promise.reject(
      new Error("[KeyStore.storeKeys] Key metadata doesn't match"),
    );
  }

  try {
    keyStore.storeKeys([encryptedKey]);

    return Promise.reject(
      new Error(
        "[KeyStore.updateKeys] Doesn't error when storing a stored key",
      ),
    );
  } catch (e) {
    // good!
  }

  // make sure we can't store a key that exists

  const allMetadata = await keyStore.loadAllKeyMetadata();

  if (
    allMetadata.length !== 1 ||
    keyMetadata.publicKey !== allMetadata[0].publicKey
  ) {
    return Promise.reject(
      new Error(
        "[KeyStore.loadAllKeyMetadata] loadAllKeyMetadata doesn't match",
      ),
    );
  }

  const allKeys = await keyStore.loadAllKeys();

  if (
    allKeys.length !== 1 ||
    encryptedKey.encryptedPrivateKey !== allKeys[0].encryptedPrivateKey
  ) {
    return Promise.reject(
      new Error("[KeyStore.loadAllKeys] loadAllKeys doesn't match"),
    );
  }

  const removalMetadata = await keyStore.removeKey(encryptedKey.publicKey);

  if (!removalMetadata || keyMetadata.publicKey !== removalMetadata.publicKey) {
    return Promise.reject(
      new Error("[KeyStore.removeKey] Removed metadata doesn't match"),
    );
  }

  if (!removalMetadata || keyMetadata.publicKey !== removalMetadata.publicKey) {
    return Promise.reject(
      new Error("[KeyStore.removeKey] Removed metadata doesn't match"),
    );
  }

  const noKeys = await keyStore.loadAllKeys();

  if (noKeys.length) {
    return Promise.reject(new Error("[KeyStore.removeKey] Key not removed"));
  }

  return Promise.resolve(true);
}
