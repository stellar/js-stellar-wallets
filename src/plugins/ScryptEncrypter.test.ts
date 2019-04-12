import StellarSdk from "stellar-sdk";

import { NONCE_BYTES, ScryptEncrypter } from "./ScryptEncrypter";

import { KeyType } from "../types";

test("encrypts and decrypts a key", async () => {
  const key = {
    type: KeyType.plaintextKey,
    publicKey: "AVACYN",
    privateKey: "ARCHANGEL",
  };

  const password = "This is a really cool password and is good";
  const salt = "Also this salt is really key, and good";
  const nonce = new Uint8Array(NONCE_BYTES).fill(42);

  const encryptedKey = await ScryptEncrypter.encryptKey({
    key,
    password,
    salt,
    nonce,
  });

  expect(encryptedKey).toBeTruthy();
  expect(encryptedKey.encryptedPrivateKey).toBeTruthy();
  expect(encryptedKey.encryptedPrivateKey).not.toEqual(key.privateKey);
  expect(encryptedKey.encryptedPrivateKey).toEqual(
    "ASoqKioqKioqKioqKioqKioqKioqKioqKghXdTQ4aKmd0WIKwT5YjOCtN95jMeXe1UI=",
  );

  const decryptedKey = await ScryptEncrypter.decryptKey({
    encryptedKey,
    password,
  });

  expect(decryptedKey).toBeTruthy();
  expect(decryptedKey.privateKey).not.toEqual(encryptedKey.encryptedPrivateKey);
  expect(decryptedKey.privateKey).toEqual(key.privateKey);
});

test("encrypts and decrypts a StellarX seed", async () => {
  const seed = "SCHKKYK3B3MPQKDTUVS37WSVHJ7EY6YRAGKOMOZJUOOMKVXTHTHBPZVL";
  const account = StellarSdk.Keypair.fromSecret(seed);

  const key = {
    type: KeyType.plaintextKey,
    publicKey: account.publicKey(),
    privateKey: seed,
  };

  const password = "hello";
  const salt = "salty";
  const nonce = new Uint8Array(NONCE_BYTES).fill(42);

  const encryptedKey = await ScryptEncrypter.encryptKey({
    key,
    password,
    salt,
    nonce,
  });

  expect(encryptedKey).toBeTruthy();
  expect(encryptedKey.encryptedPrivateKey).toBeTruthy();
  expect(encryptedKey.encryptedPrivateKey).not.toEqual(key.privateKey);

  expect(encryptedKey.encryptedPrivateKey).toEqual(
    "ASoqKioqKioqKioqKioqKioqKioqKioqKgjCVz5H3mKHykeuO6GA8KKJSQrTu9D9Gt8nhO" +
      "R7u3iccJc+jV768SEGOtWnwU6x4o46LxhKI8nQGMahV4JpqruESNW8vwt0OQ==",
  );

  const decryptedKey = await ScryptEncrypter.decryptKey({
    encryptedKey,
    password,
  });

  expect(decryptedKey).toBeTruthy();
  expect(decryptedKey.privateKey).not.toEqual(encryptedKey.encryptedPrivateKey);
  expect(decryptedKey.privateKey).toEqual(key.privateKey);
});
