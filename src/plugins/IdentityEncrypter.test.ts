import { IdentityEncrypter } from "./IdentityEncrypter";

it("encrypts to itself", async () => {
  const key = {
    type: "Angel",
    publicKey: "AVACYN",
  };
  expect(
    await IdentityEncrypter.encryptKey({
      key,
    }),
  ).toEqual(key);
});

it("decrypts to itself", async () => {
  const key = {
    type: "Angel",
    publicKey: "AVACYN",
  };
  expect(
    await IdentityEncrypter.decryptKey({
      key,
    }),
  ).toEqual(key);
});
