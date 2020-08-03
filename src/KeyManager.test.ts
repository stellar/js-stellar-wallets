import { mockRandomForEach } from "jest-mock-random";
import sinon from "sinon";
import StellarBase from "stellar-base";

import { KeyType } from "./constants/keys";
import { KeyManager } from "./KeyManager";
import { IdentityEncrypter } from "./plugins/IdentityEncrypter";
import { MemoryKeyStore } from "./plugins/MemoryKeyStore";
import { ScryptEncrypter } from "./plugins/ScryptEncrypter";

// tslint:disable-next-line
describe("KeyManager", function() {
  let clock: sinon.SinonFakeTimers;

  beforeEach(() => {
    clock = sinon.useFakeTimers(666);
    mockRandomForEach(0.5);
  });

  afterEach(() => {
    clock.restore();
  });

  test("Save an ID of one's own", async () => {
    const testStore = new MemoryKeyStore();
    const testKeyManager = new KeyManager({
      keyStore: testStore,
    });

    const id = "this is a very good id, and I like it";

    testKeyManager.registerEncrypter(IdentityEncrypter);

    const password = "test";
    const metadata = await testKeyManager.storeKey({
      key: {
        id,
        type: KeyType.plaintextKey,
        publicKey: "AVACYN",
        privateKey: "ARCHANGEL",
      },
      password,
      encrypterName: "IdentityEncrypter",
    });

    expect(metadata).toEqual({
      id,
    });

    expect(await testKeyManager.loadAllKeyIds()).toEqual([id]);

    expect(await testKeyManager.loadKey(id, password)).toEqual({
      id,
      type: KeyType.plaintextKey,
      publicKey: "AVACYN",
      privateKey: "ARCHANGEL",
    });
  });

  test("Save and remove an ID of one's own", async () => {
    const testStore = new MemoryKeyStore();
    const testKeyManager = new KeyManager({
      keyStore: testStore,
    });

    const id = "this is a very good id, and I like it";

    testKeyManager.registerEncrypter(IdentityEncrypter);

    const password = "test";
    const metadata = await testKeyManager.storeKey({
      key: {
        id,
        type: KeyType.plaintextKey,
        publicKey: "AVACYN",
        privateKey: "ARCHANGEL",
      },
      password,
      encrypterName: "IdentityEncrypter",
    });

    expect(metadata).toEqual({
      id,
    });

    expect(await testKeyManager.loadAllKeyIds()).toEqual([id]);

    expect(await testKeyManager.loadKey(id, password)).toEqual({
      id,
      type: KeyType.plaintextKey,
      publicKey: "AVACYN",
      privateKey: "ARCHANGEL",
    });

    await testKeyManager.removeKey(metadata.id);

    try {
      await testKeyManager.loadKey(id, password);
      expect(
        "The function should have thrown but didn't, the test failed!",
      ).toBe(null);
    } catch (e) {
      expect(e.toString()).toContain("Key not found");
    }
  });

  test("Save keys", async () => {
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
      id: "0.5",
    });

    expect(await testKeyManager.loadKey("0.5", password)).toEqual({
      id: "0.5",
      privateKey: "ARCHANGEL",
      publicKey: "AVACYN",
      type: "plaintextKey",
    });
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
      id: "0.5",
    });

    expect(await testKeyManager.loadKey("0.5", password)).toEqual({
      id: "0.5",
      privateKey: "ARCHANGEL",
      publicKey: "AVACYN",
      type: "plaintextKey",
    });

    await testKeyManager.removeKey(metadata.id);

    try {
      await testKeyManager.loadKey("0.5", password);
      expect(
        "The function should have thrown but didn't, the test failed!",
      ).toBe(null);
    } catch (e) {
      expect(e.toString()).toContain("Key not found");
    }
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
      fee: "100",
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

    test("Accepts challenges with zero seqs", async () => {
      const authServer = "https://www.stellar.org/auth";
      const password = "very secure password";

      const keyNetwork = StellarBase.Networks.TESTNET;

      const token = "👍";
      const account = new StellarBase.Account(
        StellarBase.Keypair.random().publicKey(),
        "-1",
      );

      const tx = new StellarBase.TransactionBuilder(account, {
        fee: "10000",
        networkPassphrase: keyNetwork,
      })
        .setTimeout(1000)
        .build()
        .toXDR();

      fetch
        // @ts-ignore
        .mockResponseOnce(
          JSON.stringify({
            transaction: tx,
            network_passphrase: keyNetwork,
          }),
        )
        // @ts-ignore
        .mockResponseOnce(
          JSON.stringify({
            token,
            status: 1,
            message: "Good job friend",
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
        const res = await testKeyManager.fetchAuthToken({
          id: keyMetadata.id,
          password,
          authServer,
        });

        expect(res).toBe(token);
      } catch (e) {
        expect(e).toBe(null);
      }
    });

    test("Rejects TXs with non-zero seq numbers", async () => {
      const authServer = "https://www.stellar.org/auth";
      const password = "very secure password";

      const keyNetwork = StellarBase.Networks.TESTNET;

      const account = new StellarBase.Account(
        StellarBase.Keypair.random().publicKey(),
        "1",
      );

      const tx = new StellarBase.TransactionBuilder(account, {
        fee: "10000",
        networkPassphrase: keyNetwork,
      })
        .setTimeout(1000)
        .build()
        .toXDR();

      // @ts-ignore
      fetch.mockResponseOnce(
        JSON.stringify({
          transaction: tx,
          network_passphrase: keyNetwork,
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

        expect("This test failed: transaction didn't cause error").toBe(null);
      } catch (e) {
        expect(e.toString()).toMatch(`Invalid transaction`);
      }
    });
  });
});

describe("KeyManager Scrypt", () => {
  let clock: sinon.SinonFakeTimers;

  beforeEach(() => {
    clock = sinon.useFakeTimers(666);
    mockRandomForEach(0.5);
  });

  afterEach(() => {
    clock.restore();
  });

  test("Save / remove keys", async () => {
    const testStore = new MemoryKeyStore();
    const testKeyManager = new KeyManager({
      keyStore: testStore,
    });

    testKeyManager.registerEncrypter(ScryptEncrypter);

    const password = "test";
    const metadata = await testKeyManager.storeKey({
      key: {
        type: KeyType.plaintextKey,
        publicKey: "AVACYN",
        privateKey: "ARCHANGEL",
      },
      password,
      encrypterName: ScryptEncrypter.name,
    });

    expect(metadata).toEqual({
      id: "0.5",
    });

    expect(await testKeyManager.loadKey("0.5", password)).toEqual({
      id: "0.5",
      privateKey: "ARCHANGEL",
      publicKey: "AVACYN",
      type: "plaintextKey",
    });

    try {
      await testKeyManager.loadKey(
        "0.5",
        "i don't know the password but I'm hoping the decrypter works anyway",
      );
      expect(
        "The function should have thrown but didn't, the test failed!",
      ).toBe(null);
    } catch (e) {
      expect(e.toString()).toContain("Couldn’t decrypt key");
    }

    await testKeyManager.removeKey(metadata.id);

    try {
      await testKeyManager.loadKey("0.5", password);
      expect(
        "The function should have thrown but didn't, the test failed!",
      ).toBe(null);
    } catch (e) {
      expect(e.toString()).toContain("Key not found");
    }
  });
});

describe("KeyManager Scrypt, multiple keys with different passwords", () => {
  let clock: sinon.SinonFakeTimers;

  beforeEach(() => {
    clock = sinon.useFakeTimers(666);
  });

  afterEach(() => {
    clock.restore();
  });

  test("Save multiple keys", async () => {
    const testStore = new MemoryKeyStore();
    const testKeyManager = new KeyManager({
      keyStore: testStore,
    });

    testKeyManager.registerEncrypter(ScryptEncrypter);

    const password1 = "test1";
    const metadata1 = await testKeyManager.storeKey({
      key: {
        id: "key1",
        type: KeyType.plaintextKey,
        publicKey: "AVACYN1",
        privateKey: "ARCHANGEL1",
      },
      password: password1,
      encrypterName: ScryptEncrypter.name,
    });

    expect(metadata1).toEqual({
      id: "key1",
    });

    expect(await testKeyManager.loadKey("key1", password1)).toEqual({
      id: "key1",
      privateKey: "ARCHANGEL1",
      publicKey: "AVACYN1",
      type: "plaintextKey",
    });

    const password2 = "test1";
    const metadata2 = await testKeyManager.storeKey({
      key: {
        id: "key2",
        type: KeyType.plaintextKey,
        publicKey: "AVACYN2",
        privateKey: "ARCHANGEL2",
      },
      password: password2,
      encrypterName: ScryptEncrypter.name,
    });

    expect(metadata2).toEqual({
      id: "key2",
    });

    expect(await testKeyManager.loadKey("key2", password2)).toEqual({
      id: "key2",
      privateKey: "ARCHANGEL2",
      publicKey: "AVACYN2",
      type: "plaintextKey",
    });

    expect(await testKeyManager.loadKey("key1", password1)).toEqual({
      id: "key1",
      privateKey: "ARCHANGEL1",
      publicKey: "AVACYN1",
      type: "plaintextKey",
    });
  });
});
