import sinon from "sinon";

import { EncryptedKey } from "../types";
import { MemoryKeyStore } from "./MemoryKeyStore";

describe("MemoryKeyStore", function() {
  beforeEach(() => {
    this.clock = sinon.useFakeTimers(666);
  });

  afterEach(() => {
    this.clock.restore();
  });

  it("properly stores keys", async () => {
    const testStore = new MemoryKeyStore();

    const encryptedKey: EncryptedKey = {
      key: {
        type: "Angel",
        publicKey: "AVACYN",
      },
      encrypterName: "Test",
      salt: "SLFKJSDLKFJLSKDJFLKSJD",
    };

    const keyMetadata = {
      type: "Angel",
      encrypterName: "Test",
      publicKey: "AVACYN",
      creationTime: 666,
      modifiedTime: 666,
    };

    const testMetadata = await testStore.storeKeys([encryptedKey]);

    expect(testMetadata).toEqual([keyMetadata]);

    const keys = await testStore.listKeys();

    expect(keys).toEqual([keyMetadata]);

    const allKeys = await testStore.loadAllKeys();

    expect(allKeys).toEqual([encryptedKey]);
  });
});
