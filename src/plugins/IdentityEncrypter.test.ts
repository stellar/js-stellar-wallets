import { KeyType } from "../types";

import { IdentityEncrypter } from "./IdentityEncrypter";

const key = {
  type: KeyType.plaintextKey,
  publicKey: "AVACYN",
  privateKey: "ARCHANGEL",
};

const encryptedKey = {
  key: {
    type: KeyType.plaintextKey,
    publicKey: "AVACYN",
    privateKey: "ARCHANGEL",
  },
  encrypterName: "IdentityEncrypter",
  salt: "identity",
};

it("encrypts to itself", async () => {
  expect(await IdentityEncrypter.encryptKey({ key })).toEqual(encryptedKey);
});

it("decrypts to itself", async () => {
  expect(await IdentityEncrypter.decryptKey({ encryptedKey })).toEqual(key);
});
