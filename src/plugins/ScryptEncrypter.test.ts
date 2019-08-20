import { KeyType } from "../constants/keys";
import { testEncrypter } from "../PluginTesting";
import { ScryptEncrypter } from "./ScryptEncrypter";

test("encrypts and decrypts a key", async () => {
  const key = {
    type: KeyType.plaintextKey,
    publicKey: "AVACYN",
    privateKey: "ARCHANGEL",
    id: "PURIFIER",
    path: "PATH",
    extra: "EXTRA",
  };

  const password = "This is a really cool password and is good";

  const encryptedKey = await ScryptEncrypter.encryptKey({
    key,
    password,
  });

  expect(encryptedKey).toBeTruthy();
  expect(encryptedKey.encryptedBlob).toBeTruthy();
  expect(encryptedKey.encryptedBlob).not.toEqual(key.privateKey);

  const decryptedKey = await ScryptEncrypter.decryptKey({
    encryptedKey,
    password,
  });

  expect(decryptedKey.privateKey).not.toEqual(encryptedKey.encryptedBlob);
  expect(decryptedKey).toEqual(key);
});

it("passes PluginTesting", async () => {
  expect(await testEncrypter(ScryptEncrypter)).toEqual(true);
});
