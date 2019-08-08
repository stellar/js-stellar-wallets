import { EncryptedKey } from "../types";

import { getKeyMetadata } from "./getKeyMetadata";

describe("getKeyMetadata", () => {
  test("ledger key", () => {
    const encryptedKey: EncryptedKey = {
      id: "PURIFIER",
      encryptedBlob: "BLOB",
      encrypterName: "Test",
      salt: "SLFKJSDLKFJLSKDJFLKSJD",
      creationTime: 666,
      modifiedTime: 666,
    };

    expect(getKeyMetadata(encryptedKey)).toEqual({
      id: "PURIFIER",
      creationTime: 666,
      modifiedTime: 666,
    });
  });
});
