import { KeyType } from "../constants/keys";
import { EncryptedKey } from "../types";

import { getKeyMetadata } from "./getKeyMetadata";

describe("getKeyMetadata", () => {
  test("ledger key", () => {
    const encryptedKey: EncryptedKey = {
      type: KeyType.plaintextKey,
      publicKey: "AVACYN",
      encryptedPrivateKey: "ARCHANGEL",
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
