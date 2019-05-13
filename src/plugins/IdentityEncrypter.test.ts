import { KeyType } from "../constants/keys";

import { IdentityEncrypter } from "./IdentityEncrypter";

import { testEncrypter } from "../PluginTesting";

const key = {
  type: KeyType.plaintextKey,
  publicKey: "AVACYN",
  privateKey: "ARCHANGEL",
};

const encryptedKey = {
  type: KeyType.plaintextKey,
  publicKey: "AVACYN",
  encryptedPrivateKey: "ARCHANGEL",
  encrypterName: "IdentityEncrypter",
  salt: "identity",
};

it("encrypts to itself", async () => {
  expect(await IdentityEncrypter.encryptKey({ key })).toEqual(encryptedKey);
});

it("decrypts to itself", async () => {
  expect(await IdentityEncrypter.decryptKey({ encryptedKey })).toEqual(key);
});

it("passes the Plugin tester", async () => {
  expect(await testEncrypter(IdentityEncrypter)).toEqual(true);
});
