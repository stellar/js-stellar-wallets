import { KeyType } from "../constants/keys";
import { EncryptedKey, Key } from "../types";

import { IdentityEncrypter } from "./IdentityEncrypter";

import { testEncrypter } from "../PluginTesting";

const key: Key = {
  id: "PURIFIER",
  type: KeyType.plaintextKey,
  publicKey: "AVACYN",
  privateKey: "ARCHANGEL",
  creationTime: 666,
  modifiedTime: 666,
};

const encryptedKey: EncryptedKey = {
  id: "PURIFIER",
  encryptedBlob: JSON.stringify({
    type: KeyType.plaintextKey,
    publicKey: "AVACYN",
    privateKey: "ARCHANGEL",
  }),
  encrypterName: "IdentityEncrypter",
  salt: "identity",
  creationTime: 666,
  modifiedTime: 666,
};

it("encrypts to itself", async () => {
  expect(await IdentityEncrypter.encryptKey({ key })).toEqual(encryptedKey);
});

it("decrypts to itself", async () => {
  expect(await IdentityEncrypter.decryptKey({ encryptedKey })).toEqual(key);
});

it("passes PluginTesting", async () => {
  expect(await testEncrypter(IdentityEncrypter)).toEqual(true);
});
