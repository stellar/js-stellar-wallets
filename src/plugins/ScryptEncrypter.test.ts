import { ScryptEncrypter } from "./ScryptEncrypter";

import { KeyType } from "../types";

test("encrypts and decrypts a key", async () => {
  const key = {
    type: KeyType.plaintextKey,
    publicKey: "AVACYN",
    privateKey: "ARCHANGEL",
  };

  const password = "This is a really cool password and is good";

  const encryptedKey = await ScryptEncrypter.encryptKey({ key, password });

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
