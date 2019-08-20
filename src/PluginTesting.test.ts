import sinon from "sinon";

import { getKeyMetadata } from "./helpers/getKeyMetadata";
import { testEncrypter, testKeyStore } from "./PluginTesting";
import { EncryptedKey } from "./types";

describe("testEncrypter", () => {
  function encryptKeyGood({ key, password }: any) {
    return Promise.resolve({
      ...key,
      type: undefined,
      publicKey: undefined,
      privateKey: undefined,
      encryptedBlob: `${key.privateKey}${password}`,
    });
  }

  function decryptKeyGood({ encryptedKey, password }: any) {
    return Promise.resolve({
      ...encryptedKey,
      encryptedBlob: undefined,
      encrypterName: undefined,
      salt: undefined,
      privateKey: encryptedKey.encryptedBlob.split(password)[0],
    });
  }

  function encryptKeyInvalid({ key, password }: any) {
    return Promise.resolve({ key, password });
  }

  function decryptKeyInvalid({ encryptedKey, password }: any) {
    return Promise.resolve({ encryptedKey, password });
  }

  function decryptKeyIncorrect() {
    return Promise.resolve({
      privateKey: "INCORRECT",
      encryptedBlob: undefined,
      encrypterName: undefined,
      salt: undefined,
    });
  }

  test("error if passed nothing", (done) => {
    testEncrypter()
      .then(() => {
        done("Succeeded but should have failed");
      })
      .catch((err: Error) => {
        expect(err.toString()).toMatch("Encrypter not defined");
        done();
      });
  });

  test("Validates good Encrypter", (done) => {
    const goodEncrypter = {
      name: "goodEncrypter",
      encryptKey: encryptKeyGood,
      decryptKey: decryptKeyGood,
    };

    testEncrypter(goodEncrypter)
      .then(() => done())
      .catch(done);
  });

  test("Invalidates missing name", (done) => {
    const goodEncrypter = {
      encryptKey: encryptKeyGood,
      decryptKey: decryptKeyGood,
    };
    testEncrypter(goodEncrypter)
      .then(() => {
        done("Succeeded but should have failed");
      })
      .catch((err: Error) => {
        expect(err.toString()).toMatch("Name not defined");
        done();
      });
  });

  test("encryptKey should actually encrypt a key", (done) => {
    const badEncrypter = {
      name: "badEncrypter",
      encryptKey: encryptKeyInvalid,
      decryptKey: decryptKeyGood,
    };

    testEncrypter(badEncrypter)
      .then(() => {
        done("Succeeded but should have failed");
      })
      .catch((err: Error) => {
        expect(err.toString()).toMatch("Encrypted key not valid");
        done();
      });
  });

  test("decryptKey should actually decrypt a key", (done) => {
    const badEncrypter = {
      name: "badEncrypter",
      encryptKey: encryptKeyGood,
      decryptKey: decryptKeyInvalid,
    };

    testEncrypter(badEncrypter)
      .then(() => {
        done("Succeeded but should have failed");
      })
      .catch((err: Error) => {
        expect(err.toString()).toMatch("Decrypted key not valid");
        done();
      });
  });

  test("decryptKey should be the same as the original", (done) => {
    const badEncrypter = {
      name: "badEncrypter",
      encryptKey: encryptKeyGood,
      decryptKey: decryptKeyIncorrect,
    };

    testEncrypter(badEncrypter)
      .then(() => {
        done("Succeeded but should have failed");
      })
      .catch((err: Error) => {
        expect(err.toString()).toMatch(
          "Decrypted key doesn't match original key",
        );
        done();
      });
  });
});

describe("testKeyStore", () => {
  function makeKeyMetadata(encryptedKey: any) {
    return getKeyMetadata({
      ...encryptedKey,
    });
  }

  let storage: any = {};
  let skipStorageChecks: boolean = false;
  let skipUpdateChecks: boolean = false;

  const goodKeyStore = {
    name: "goodKeyStore",
    configure() {
      return Promise.resolve();
    },
    storeKeys(keys: EncryptedKey[]) {
      // kill anything already in storage
      if (!skipStorageChecks) {
        const areStored = keys.filter((key) => storage[key.id]);
        if (areStored.length) {
          throw new Error("stored already");
        }
      }

      keys.forEach((key) => {
        storage[key.id] = key;
      });

      return Promise.resolve(
        keys.map((encryptedKey: EncryptedKey) => makeKeyMetadata(encryptedKey)),
      );
    },
    updateKeys(keys: EncryptedKey[]) {
      // kill anything already in storage
      if (!skipUpdateChecks) {
        const areNotStored = keys.filter((key) => !storage[key.id]);
        if (areNotStored.length) {
          throw new Error("stored already");
        }
      }

      keys.forEach((key) => {
        storage[key.id] = key;
      });

      return Promise.resolve(
        keys.map((encryptedKey: EncryptedKey) => makeKeyMetadata(encryptedKey)),
      );
    },
    loadKey(id: string) {
      return Promise.resolve(storage[id]);
    },
    removeKey(id: string) {
      const key = storage[id];

      if (!key) {
        return Promise.resolve(undefined);
      }

      delete storage[id];

      return Promise.resolve(makeKeyMetadata(key));
    },
    loadAllKeyMetadata() {
      return Promise.resolve(Object.values(storage).map(makeKeyMetadata));
    },
    loadAllKeys() {
      return Promise.resolve(Object.values(storage));
    },
  };

  let clock: sinon.SinonFakeTimers;

  beforeEach(() => {
    clock = sinon.useFakeTimers(666);

    // clear storage
    storage = {};
    skipStorageChecks = false;
    skipUpdateChecks = false;
  });

  afterEach(() => {
    clock.restore();
  });

  test("error if passed nothing", (done) => {
    testKeyStore()
      .then(() => {
        done("Succeeded but should have failed");
      })
      .catch((err: Error) => {
        expect(err.toString()).toMatch("KeyStore not defined");
        done();
      });
  });

  test("error if bad name", (done) => {
    testKeyStore({ ...goodKeyStore, name: undefined })
      .then(() => {
        done("Succeeded but should have failed");
      })
      .catch((err: Error) => {
        expect(err.toString()).toMatch("Name not defined");
        done();
      });
  });

  test("error if bad configure", (done) => {
    testKeyStore({ ...goodKeyStore, configure: undefined })
      .then(() => {
        done("Succeeded but should have failed");
      })
      .catch((err: Error) => {
        expect(err.toString()).toMatch("Invalid function");
        expect(err.toString()).toMatch("[KeyStore.configure]");
        done();
      });
  });

  test("error if bad storeKeys", (done) => {
    testKeyStore({ ...goodKeyStore, storeKeys: undefined })
      .then(() => {
        done("Succeeded but should have failed");
      })
      .catch((err: Error) => {
        expect(err.toString()).toMatch("Invalid function");
        expect(err.toString()).toMatch("[KeyStore.storeKeys]");
        done();
      });
  });

  test("error if bad updateKeys", (done) => {
    testKeyStore({ ...goodKeyStore, updateKeys: undefined })
      .then(() => {
        done("Succeeded but should have failed");
      })
      .catch((err: Error) => {
        expect(err.toString()).toMatch("Invalid function");
        expect(err.toString()).toMatch("[KeyStore.updateKeys]");
        done();
      });
  });

  test("error if bad loadKey", (done) => {
    testKeyStore({ ...goodKeyStore, loadKey: undefined })
      .then(() => {
        done("Succeeded but should have failed");
      })
      .catch((err: Error) => {
        expect(err.toString()).toMatch("Invalid function");
        expect(err.toString()).toMatch("[KeyStore.loadKey]");
        done();
      });
  });

  test("error if bad removeKey", (done) => {
    testKeyStore({ ...goodKeyStore, removeKey: undefined })
      .then(() => {
        done("Succeeded but should have failed");
      })
      .catch((err: Error) => {
        expect(err.toString()).toMatch("Invalid function");
        expect(err.toString()).toMatch("[KeyStore.removeKey]");
        done();
      });
  });

  test("error if bad loadAllKeyMetadata", (done) => {
    testKeyStore({ ...goodKeyStore, loadAllKeyMetadata: undefined })
      .then(() => {
        done("Succeeded but should have failed");
      })
      .catch((err: Error) => {
        expect(err.toString()).toMatch("Invalid function");
        expect(err.toString()).toMatch("[KeyStore.loadAllKeyMetadata]");
        done();
      });
  });

  test("error if bad loadAllKeys", (done) => {
    testKeyStore({ ...goodKeyStore, loadAllKeys: undefined })
      .then(() => {
        done("Succeeded but should have failed");
      })
      .catch((err: Error) => {
        expect(err.toString()).toMatch("Invalid function");
        expect(err.toString()).toMatch("[KeyStore.loadAllKeys]");
        done();
      });
  });

  test("Works with good keystore", (done) => {
    testKeyStore(goodKeyStore)
      .then(() => {
        done();
      })
      .catch(done);
  });

  test("Error when doesn't check storeKeys", (done) => {
    skipStorageChecks = true;
    testKeyStore(goodKeyStore)
      .then(() => {
        done("Succeeded but should have failed");
      })
      .catch((err: Error) => {
        expect(err.toString()).toMatch(
          "Doesn't error when storing a stored key",
        );
        done();
      });
  });

  test("Error when doesn't check updateKeys", (done) => {
    skipUpdateChecks = true;
    testKeyStore(goodKeyStore)
      .then(() => {
        done("Succeeded but should have failed");
      })
      .catch((err: Error) => {
        expect(err.toString()).toMatch(
          "Doesn't error when updating a nonexistent key",
        );
        done();
      });
  });
});
