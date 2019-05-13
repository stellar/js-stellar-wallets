import StellarSdk from "stellar-sdk";
import { KeyType } from "./constants/keys";
import { EncryptedKey, Encrypter, Key, KeyStore } from "./types";

function isKey(obj: any): obj is Key {
  return obj.privateKey !== undefined;
}

function isEncryptedKey(obj: any): obj is EncryptedKey {
  return obj.encryptedPrivateKey !== undefined;
}

export async function testEncrypter(encrypter: any): Promise<void> {
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

  if (encryptedKey.encryptedPrivateKey === key.privateKey) {
    return Promise.reject(
      new Error(
        "[Encrypter.encryptKey] Encrypted key is the same as the private key",
      ),
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

  if (decryptedKey.privateKey === encryptedKey.encryptedPrivateKey) {
    return Promise.reject(
      new Error(
        "[Encrypter.decryptKey] Decrypted key is the same as the encrypted key",
      ),
    );
  }

  if (decryptedKey.privateKey !== key.privateKey) {
    return Promise.reject(
      new Error(
        "[Encrypter.decryptKey] Decrypted key doesn't match original key",
      ),
    );
  }

  return Promise.resolve();
}

export async function testKeyStore(keyStore: KeyStore): Promise<void> {
  console.log(keyStore);
  return Promise.resolve();
}
