import sinon from "sinon";

import { KeyType } from "./types";

import { KeyManager } from "./KeyManager";

import { IdentityEncrypter } from "./plugins/IdentityEncrypter";
import { MemoryKeyStore } from "./plugins/MemoryKeyStore";

// tslint:disable-next-line
describe("KeyManager", function() {
  let clock: sinon.SinonFakeTimers;

  beforeEach(() => {
    clock = sinon.useFakeTimers(666);
  });

  afterEach(() => {
    clock.restore();
  });

  const testStore = new MemoryKeyStore();
  const testKeyManager = new KeyManager({
    keyStore: testStore,
  });

  testKeyManager.registerEncrypter(IdentityEncrypter);

  test("Save / remove keys", async () => {
    const metadata = await testKeyManager.storeKey({
      key: {
        type: KeyType.plaintextKey,
        publicKey: "AVACYN",
        privateKey: "ARCHANGEL",
      },
      password: "test",
      encrypterName: "IdentityEncrypter",
    });

    expect(metadata).toEqual({
      type: KeyType.plaintextKey,
      encrypterName: "IdentityEncrypter",
      publicKey: "AVACYN",
      creationTime: 666,
      modifiedTime: 666,
    });

    expect(await testKeyManager.listKeys()).toEqual([
      {
        type: KeyType.plaintextKey,
        encrypterName: "IdentityEncrypter",
        publicKey: "AVACYN",
        creationTime: 666,
        modifiedTime: 666,
      },
    ]);

    await testKeyManager.removeKey("AVACYN");

    expect(await testKeyManager.listKeys()).toEqual([]);
  });
});
