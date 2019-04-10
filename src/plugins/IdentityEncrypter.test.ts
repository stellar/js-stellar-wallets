import { KeyType } from "../types";

import { IdentityEncrypter } from "./IdentityEncrypter";

it("encrypts to itself", async () => {
  const key = {
    type: KeyType.plaintextKey,
    publicKey: "AVACYN",
    privateKey: "ARCHANGEL",
  };
  expect(
    await IdentityEncrypter.encryptKey({
      key,
    }),
  ).toEqual(key);
});

it("decrypts to itself", async () => {
  const key = {
    type: KeyType.plaintextKey,
    publicKey: "AVACYN",
    privateKey: "ARCHANGEL",
  };
  expect(
    await IdentityEncrypter.decryptKey({
      key,
    }),
  ).toEqual(key);
});
