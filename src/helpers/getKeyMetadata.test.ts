import { EncryptedKey } from "../types";

import { getKeyMetadata } from "./getKeyMetadata";

describe("getKeyMetadata", () => {
  test("ledger key", () => {
    const encryptedKey: EncryptedKey = {
      id: "PURIFIER",
      encryptedBlob: "BLOB",
      encrypterName: "Test",
      salt: "SLFKJSDLKFJLSKDJFLKSJD",
    };

    expect(getKeyMetadata(encryptedKey)).toEqual({
      id: "PURIFIER",
    });
  });
});
