import sinon from "sinon";
import StellarBase from "stellar-base";

import { KeyType } from "./constants/keys";
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

  test("Save / remove keys", async () => {
    const testStore = new MemoryKeyStore();
    const testKeyManager = new KeyManager({
      keyStore: testStore,
    });

    testKeyManager.registerEncrypter(IdentityEncrypter);

    const password = "test";
    const metadata = await testKeyManager.storeKey({
      key: {
        type: KeyType.plaintextKey,
        publicKey: "AVACYN",
        privateKey: "ARCHANGEL",
      },
      password,
      encrypterName: "IdentityEncrypter",
    });

    expect(metadata).toEqual({
      id: "2d1707a654a4edbf3a64689e4ca493a85afa2a4f",
    });

    expect(await testKeyManager.loadAllKeys(password)).toEqual([
      {
        id: "2d1707a654a4edbf3a64689e4ca493a85afa2a4f",
        privateKey: "ARCHANGEL",
        publicKey: "AVACYN",
        type: "plaintextKey",
      },
    ]);

    await testKeyManager.removeKey(metadata.id);

    expect(await testKeyManager.loadAllKeys(password)).toEqual([]);
  });

  test("Sign transactions", async () => {
    // set up the manager
    const testStore = new MemoryKeyStore();
    const testKeyManager = new KeyManager({
      keyStore: testStore,
    });
    const network = StellarBase.Networks.TESTNET;

    testKeyManager.registerEncrypter(IdentityEncrypter);

    const keypair = StellarBase.Keypair.master(network);

    // save this key
    const keyMetadata = await testKeyManager.storeKey({
      key: {
        type: KeyType.plaintextKey,
        publicKey: keypair.publicKey(),
        privateKey: keypair.secret(),
        network,
      },
      password: "test",
      encrypterName: "IdentityEncrypter",
    });

    const source = new StellarBase.Account(
      "GBBM6BKZPEHWYO3E3YKREDPQXMS4VK35YLNU7NFBRI26RAN7GI5POFBB",
      "0",
    );

    const transaction = new StellarBase.TransactionBuilder(source, {
      fee: 100,
      networkPassphrase: network,
    })
      .addOperation(StellarBase.Operation.inflation({}))
      .setTimeout(StellarBase.TimeoutInfinite)
      .build();

    const signedTransaction = await testKeyManager.signTransaction({
      transaction,
      id: keyMetadata.id,
      password: "test",
    });

    expect(
      keypair.verify(
        transaction.hash(),
        signedTransaction.signatures[0].signature(),
      ),
    ).toEqual(true);
  });

  describe("fetchAuthToken", () => {
    beforeEach(() => {
      // @ts-ignore
      fetch.resetMocks();
    });

    test("Throws errors for missing params", async () => {
      // set up the manager
      const testStore = new MemoryKeyStore();
      const testKeyManager = new KeyManager({
        keyStore: testStore,
      });
      try {
        // @ts-ignore
        await testKeyManager.fetchAuthToken({});
        expect("This test failed").toBe(null);
      } catch (e) {
        expect(e).toBeTruthy();
      }
    });

    test("Rejects challenges that return errors", async () => {
      const authServer = "https://www.stellar.org/auth";
      const error = "Test error";
      const password = "very secure password";

      // @ts-ignore
      fetch.mockResponseOnce(
        JSON.stringify({
          error,
        }),
      );

      // set up the manager
      const testStore = new MemoryKeyStore();
      const testKeyManager = new KeyManager({
        keyStore: testStore,
      });
      const network = StellarBase.Networks.TESTNET;

      testKeyManager.registerEncrypter(IdentityEncrypter);

      const keypair = StellarBase.Keypair.master(network);

      // save this key
      const keyMetadata = await testKeyManager.storeKey({
        key: {
          type: KeyType.plaintextKey,
          publicKey: keypair.publicKey(),
          privateKey: keypair.secret(),
          network,
        },
        password,
        encrypterName: "IdentityEncrypter",
      });

      try {
        await testKeyManager.fetchAuthToken({
          id: keyMetadata.id,
          password,
          authServer,
        });

        expect("This test failed").toBe(null);
      } catch (e) {
        expect(e.toString()).toBe(`Error: ${error}`);
      }
    });

    test("Rejects challenges with network mismatches", async () => {
      const authServer = "https://www.stellar.org/auth";
      const password = "very secure password";

      const keyNetwork = StellarBase.Networks.TESTNET;
      const challengeNetwork = StellarBase.Networks.PUBLIC;

      // @ts-ignore
      fetch.mockResponseOnce(
        JSON.stringify({
          network_passphrase: challengeNetwork,
        }),
      );

      // set up the manager
      const testStore = new MemoryKeyStore();
      const testKeyManager = new KeyManager({
        keyStore: testStore,
      });

      testKeyManager.registerEncrypter(IdentityEncrypter);

      const keypair = StellarBase.Keypair.master(keyNetwork);

      // save this key
      const keyMetadata = await testKeyManager.storeKey({
        key: {
          type: KeyType.plaintextKey,
          publicKey: keypair.publicKey(),
          privateKey: keypair.secret(),
          network: keyNetwork,
        },
        password,
        encrypterName: "IdentityEncrypter",
      });

      try {
        await testKeyManager.fetchAuthToken({
          id: keyMetadata.id,
          password,
          authServer,
        });

        expect("This test failed").toBe(null);
      } catch (e) {
        expect(e.toString()).toMatch(`Network mismatch`);
      }
    });
  });
});
