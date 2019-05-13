import sinon from "sinon";

import { KeyType } from "../constants/keys";
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
      type: KeyType.plaintextKey,
      publicKey: "AVACYN",
      encryptedPrivateKey: "ARCHANGEL",
      encrypterName: "Test",
      salt: "SLFKJSDLKFJLSKDJFLKSJD",
    };

    const keyMetadata = {
      type: KeyType.plaintextKey,
      encrypterName: "Test",
      publicKey: "AVACYN",
      creationTime: 666,
      modifiedTime: 666,
    };

    const testMetadata = await testStore.storeKeys([encryptedKey]);

    expect(testMetadata).toEqual([keyMetadata]);

    const keys = await testStore.loadAllKeyMetadata();

    expect(keys).toEqual([keyMetadata]);

    const allKeys = await testStore.loadAllKeys();

    expect(allKeys).toEqual([encryptedKey]);
  });

  it("properly deletes keys", async () => {
    const testStore = new MemoryKeyStore();

    const encryptedKey: EncryptedKey = {
      type: KeyType.plaintextKey,
      publicKey: "AVACYN",
      encryptedPrivateKey: "ARCHANGEL",
      encrypterName: "Test",
      salt: "SLFKJSDLKFJLSKDJFLKSJD",
    };

    const keyMetadata = {
      type: KeyType.plaintextKey,
      encrypterName: "Test",
      publicKey: "AVACYN",
      creationTime: 666,
      modifiedTime: 666,
    };

    await testStore.storeKeys([encryptedKey]);

    const allKeys = await testStore.loadAllKeys();

    expect(allKeys).toEqual([encryptedKey]);

    const removalMetadata = await testStore.removeKey("AVACYN");

    expect(removalMetadata).toEqual(keyMetadata);

    const noKeys = await testStore.loadAllKeys();

    expect(noKeys).toEqual([]);
  });
});
