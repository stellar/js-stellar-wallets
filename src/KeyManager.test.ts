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
      id: "2d1707a654a4edbf3a64689e4ca493a85afa2a4f",
      creationTime: 666,
      modifiedTime: 666,
    });

    expect(await testKeyManager.loadAllKeyMetadata()).toEqual([
      {
        id: metadata.id,
        creationTime: 666,
        modifiedTime: 666,
      },
    ]);

    await testKeyManager.removeKey(metadata.id);

    expect(await testKeyManager.loadAllKeyMetadata()).toEqual([]);
  });

  test("Sign transactions", async () => {
    // set up the manager
    const testStore = new MemoryKeyStore();
    const testKeyManager = new KeyManager({
      keyStore: testStore,
    });

    testKeyManager.registerEncrypter(IdentityEncrypter);

    StellarBase.Network.useTestNetwork();

    const keypair = StellarBase.Keypair.master();

    // save this key
    const keyMetadata = await testKeyManager.storeKey({
      key: {
        type: KeyType.plaintextKey,
        publicKey: keypair.publicKey(),
        privateKey: keypair.secret(),
      },
      password: "test",
      encrypterName: "IdentityEncrypter",
    });

    const source = new StellarBase.Account(
      "GBBM6BKZPEHWYO3E3YKREDPQXMS4VK35YLNU7NFBRI26RAN7GI5POFBB",
      "0",
    );

    const transaction = new StellarBase.TransactionBuilder(source, { fee: 100 })
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
});
