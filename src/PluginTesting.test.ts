import { testEncrypter } from "./PluginTesting";

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

describe("testEncrypter", () => {
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
