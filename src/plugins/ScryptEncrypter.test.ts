import { ScryptEncrypter } from "./ScryptEncrypter";

import { EncryptedPlaintextKey, KeyType } from "../types";

test("encrypts and decrypts a key", async () => {
  const key = {
    type: KeyType.plaintextKey,
    publicKey: "AVACYN",
    privateKey: "ARCHANGEL",
  };

  const password = "This is a really cool password and is good";

  const encryptedKey = await ScryptEncrypter.encryptKey({ key, password });

  expect(encryptedKey).toBeTruthy();
  expect(
    (encryptedKey as EncryptedPlaintextKey).encryptedPrivateKey,
  ).toBeTruthy();
  expect(
    (encryptedKey as EncryptedPlaintextKey).encryptedPrivateKey,
  ).not.toEqual(key.privateKey);

  const decryptedKey = await ScryptEncrypter.decryptKey({
    encryptedKey,
    password,
  });

  expect(decryptedKey).toBeTruthy();
  expect(decryptedKey.privateKey).not.toEqual(
    (encryptedKey as EncryptedPlaintextKey).encryptedPrivateKey,
  );
  expect(decryptedKey.privateKey).toEqual(key.privateKey);
});
