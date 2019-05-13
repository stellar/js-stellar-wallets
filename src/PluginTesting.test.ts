import sinon from "sinon";

import {
  generateEncryptedKey,
  generateKeyMetadata,
  generateLedgerKey,
  generatePlaintextKey,
} from "./fixtures/keys";
import { getKeyMetadata } from "./KeyHelpers";
import { testEncrypter, testKeyStore } from "./PluginTesting";
import { EncryptedKey } from "./types";

describe("testEncrypter", () => {
  function encryptKeyGood({ key, password }: any) {
    return Promise.resolve({
      ...key,
      privateKey: undefined,
      encryptedPrivateKey: `${key.privateKey}${password}`,
    });
  }

  function decryptKeyGood({ encryptedKey, password }: any) {
    return Promise.resolve({
      ...encryptedKey,
      encryptedPrivateKey: undefined,
      encrypterName: undefined,
      salt: undefined,
      privateKey: encryptedKey.encryptedPrivateKey.split(password)[0],
    });
  }

  function encryptKeyInvalid({ key, password }: any) {
    return Promise.resolve({ key, password });
  }

  function decryptKeyInvalid({ encryptedKey, password }: any) {
    return Promise.resolve({ encryptedKey, password });
  }

  function decryptKeyIncorrect({ encryptedKey }: any) {
    return Promise.resolve({
      ...encryptedKey,
      encryptedPrivateKey: undefined,
      encrypterName: undefined,
      salt: undefined,
      privateKey: encryptedKey.encryptedPrivateKey,
    });
  }

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
      .catch((err) => {
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
      .catch((err) => {
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
      .catch((err) => {
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
      .catch((err) => {
        expect(err.toString()).toMatch(
          "Decrypted key doesn't match original key",
        );
        done();
      });
  });
});

describe("testKeyStore", () => {
  function makeKeyMetadata(encryptedKey: any) {
    return {
      encryptedKey,
      creationTime: Math.floor(Date.now() / 1000),
      modifiedTime: Math.floor(Date.now() / 1000),
    };
  }

  let storage: any = {};
  let skipStorageChecks: boolean = false;
  let skipUpdateChecks: boolean = false;

  const goodKeyStore = {
    name: "badKeyStore",
    storeKeys(keys: EncryptedKey[]) {
      // kill anything already in storage
      if (!skipStorageChecks) {
        const areStored = keys.filter((key) => storage[key.publicKey]);
        if (areStored.length) {
          throw new Error("stored already");
        }
      }

      keys.forEach((key) => {
        storage[key.publicKey] = key;
      });

      return Promise.resolve(
        keys.map((encryptedKey: EncryptedKey) => makeKeyMetadata(encryptedKey)),
      );
    },
    updateKeys(keys: EncryptedKey[]) {
      // kill anything already in storage
      if (!skipUpdateChecks) {
        const areNotStored = keys.filter((key) => !storage[key.publicKey]);
        if (areNotStored.length) {
          throw new Error("stored already");
        }
      }

      keys.forEach((key) => {
        storage[key.publicKey] = key;
      });

      return Promise.resolve(
        keys.map((encryptedKey: EncryptedKey) => makeKeyMetadata(encryptedKey)),
      );
    },
    loadKey(publicKey: string) {
      return Promise.resolve(storage[publicKey]);
    },
    removeKey(publicKey: string) {
      const key = storage[publicKey];

      if (!key) {
        return Promise.resolve(undefined);
      }

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
    testKeyStore({})
      .then(() => {
        done("Succeeded but should have failed");
      })
      .catch((err) => {
        expect(err.toString()).toMatch("No KeyStore defined");
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
      .catch((err) => {
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
      .catch((err) => {
        expect(err.toString()).toMatch(
          "Doesn't error when updating a nonexistent key",
        );
        done();
      });
  });
});
