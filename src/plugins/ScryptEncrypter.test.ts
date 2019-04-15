import StellarSdk from "stellar-sdk";

import { ScryptEncrypter } from "./ScryptEncrypter";

import { KeyType } from "../constants/keys";

test("encrypts and decrypts a key", async () => {
  const key = {
    type: KeyType.plaintextKey,
    publicKey: "AVACYN",
    privateKey: "ARCHANGEL",
  };

  const password = "This is a really cool password and is good";

  const encryptedKey = await ScryptEncrypter.encryptKey({
    key,
    password,
  });

  expect(encryptedKey).toBeTruthy();
  expect(encryptedKey.encryptedPrivateKey).toBeTruthy();
  expect(encryptedKey.encryptedPrivateKey).not.toEqual(key.privateKey);

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

  const encryptedKey = await ScryptEncrypter.encryptKey({
    key,
    password,
  });

  expect(encryptedKey).toBeTruthy();
  expect(encryptedKey.encryptedPrivateKey).toBeTruthy();
  expect(encryptedKey.encryptedPrivateKey).not.toEqual(key.privateKey);

  const decryptedKey = await ScryptEncrypter.decryptKey({
    encryptedKey,
    password,
  });

  expect(decryptedKey).toBeTruthy();
  expect(decryptedKey.privateKey).not.toEqual(encryptedKey.encryptedPrivateKey);
  expect(decryptedKey.privateKey).toEqual(key.privateKey);
});
