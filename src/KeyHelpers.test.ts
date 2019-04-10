import { EncryptedKey, KeyType } from "./types";

import { getKeyMetadata, isLedgerKey } from "./KeyHelpers";

describe("isLedgerKey", () => {
  test("ledger key", () => {
    expect(
      isLedgerKey({
        type: KeyType.plaintextKey,
        publicKey: "AVACYN",
        path: "seraph/sanctuary",
      }),
    ).toEqual(true);
  });
  test("private key", () => {
    expect(
      isLedgerKey({
        type: KeyType.plaintextKey,
        publicKey: "AVACYN",
        privateKey: "ARCHANGEL",
      }),
    ).toEqual(false);
  });
});

describe("getKeyMetadata", () => {
  test("ledger key", () => {
    const encryptedKey: EncryptedKey = {
      key: {
        type: KeyType.plaintextKey,
        publicKey: "AVACYN",
        privateKey: "ARCHANGEL",
      },
      encrypterName: "Test",
      salt: "SLFKJSDLKFJLSKDJFLKSJD",
    };

    expect(
      getKeyMetadata({
        encryptedKey,
        creationTime: 666,
        modifiedTime: 666,
      }),
    ).toEqual({
      type: KeyType.plaintextKey,
      encrypterName: "Test",
      publicKey: "AVACYN",
      creationTime: 666,
      modifiedTime: 666,
    });
  });
});
