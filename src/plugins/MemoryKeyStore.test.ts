import sinon from "sinon";

import { testKeyStore } from "../PluginTesting";
import { EncryptedKey } from "../types";
import { MemoryKeyStore } from "./MemoryKeyStore";

// tslint:disable-next-line
describe("MemoryKeyStore", function() {
  let clock: sinon.SinonFakeTimers;

  beforeEach(() => {
    clock = sinon.useFakeTimers(666);
  });

  afterEach(() => {
    clock.restore();
  });

  it("properly stores keys", async () => {
    const testStore = new MemoryKeyStore();

    const encryptedKey: EncryptedKey = {
      id: "PURIFIER",
      encryptedBlob: "BLOB",
      encrypterName: "Test",
      salt: "SLFKJSDLKFJLSKDJFLKSJD",
    };

    const keyMetadata = {
      id: "PURIFIER",
      creationTime: 666,
      modifiedTime: 666,
    };

    const testMetadata = await testStore.storeKeys([encryptedKey]);

    expect(testMetadata).toEqual([keyMetadata]);

    const keys = await testStore.loadAllKeyMetadata();

    expect(keys).toEqual([keyMetadata]);

    const allKeys = await testStore.loadAllKeys();

    expect(allKeys).toEqual([{ ...encryptedKey, ...keyMetadata }]);
  });

  it("properly deletes keys", async () => {
    const testStore = new MemoryKeyStore();

    const encryptedKey: EncryptedKey = {
      id: "PURIFIER",
      encrypterName: "Test",
      encryptedBlob: "BLOB",
      salt: "SLFKJSDLKFJLSKDJFLKSJD",
    };

    const keyMetadata = {
      id: "PURIFIER",
      creationTime: 666,
      modifiedTime: 666,
    };

    await testStore.storeKeys([encryptedKey]);

    const allKeys = await testStore.loadAllKeys();

    expect(allKeys).toEqual([{ ...encryptedKey, ...keyMetadata }]);

    const removalMetadata = await testStore.removeKey("PURIFIER");

    expect(removalMetadata).toEqual(keyMetadata);

    const noKeys = await testStore.loadAllKeys();

    expect(noKeys).toEqual([]);
  });

  it("passes PluginTesting", (done) => {
    testKeyStore(new MemoryKeyStore())
      .then(() => {
        done();
      })
      .catch(done);
  });
});
