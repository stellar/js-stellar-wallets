import sinon from "sinon";

import { EncryptedKey } from "../types";
import { BrowserStorageKeyStore } from "./BrowserStorageKeyStore";

// tslint:disable-next-line
describe("BrowserStorageKeyStore", function() {
  let clock: sinon.SinonFakeTimers;
  let testStore: BrowserStorageKeyStore;
  const encryptedKey: EncryptedKey = {
    id: "PURIFIER",
    encryptedBlob: "BLOB",
    encrypterName: "Test",
    salt: "SLFKJSDLKFJLSKDJFLKSJD",
  };
  const keyMetadata = {
    id: "PURIFIER",
  };
  const chrome = {
    storage: {
      local: {
        get: () => Promise.resolve({}),
        set: () => Promise.resolve({}),
        remove: () => Promise.resolve({}),
      },
    },
  };

  beforeEach(() => {
    clock = sinon.useFakeTimers(666);
    testStore = new BrowserStorageKeyStore();

    testStore.configure({ storage: chrome.storage.local });
  });

  afterEach(() => {
    clock.restore();
    sinon.restore();
  });

  it("properly stores keys", async () => {
    const chromeStorageLocalGetStub = sinon.stub(chrome.storage.local, "get");

    /* first call returns empty to confirm keystore 
    doesn't already exist before storing */
    chromeStorageLocalGetStub.onCall(0).returns(Promise.resolve({}));
    const testMetadata = await testStore.storeKeys([encryptedKey]);

    expect(testMetadata).toEqual([keyMetadata]);

    // subsequent calls return the keystore as expected
    chromeStorageLocalGetStub.returns(
      Promise.resolve({ [`stellarkeys:${encryptedKey.id}`]: encryptedKey }),
    );
    const allKeys = await testStore.loadAllKeys();

    expect(allKeys).toEqual([{ ...encryptedKey, ...keyMetadata }]);
  });

  it("properly deletes keys", async () => {
    const chromeStorageLocalGetStub = sinon.stub(chrome.storage.local, "get");

    /* first call returns empty to confirm keystore 
    doesn't already exist before storing */
    chromeStorageLocalGetStub.onCall(0).returns(Promise.resolve({}));
    await testStore.storeKeys([encryptedKey]);

    // subsequent calls return the keystore as expected
    chromeStorageLocalGetStub.returns(
      Promise.resolve({ [`stellarkeys:${encryptedKey.id}`]: encryptedKey }),
    );

    const allKeys = await testStore.loadAllKeys();

    expect(allKeys).toEqual([{ ...encryptedKey, ...keyMetadata }]);

    const removalMetadata = await testStore.removeKey("PURIFIER");
    chromeStorageLocalGetStub.returns(Promise.resolve({}));

    expect(removalMetadata).toEqual(keyMetadata);
    const noKeys = await testStore.loadAllKeys();

    expect(noKeys).toEqual([]);
  });

  it("passes PluginTesting", () => {
    /* 
    TODO:
    this test cannot currently be run because we 
    don't have an adequate way to stub chrome.local.storage yet */
    // testKeyStore(testStore)
    // .then(() => {
    //   done();
    // })
    // .catch(done);
  });
});
