// import sinon from "sinon";
import {
  Account,
  Asset,
  BASE_FEE,
  //  Config,
  //  HorizonAxiosClient,
  Networks,
  Operation,
  //  Server,
  TransactionBuilder,
} from "stellar-sdk";
import { getRegulatedAssetsInTx } from "./getRegulatedAssetsInTx";

describe("getRegulatedAssetsInTx with no ops moving assets", () => {
  /*
  beforeEach(function() {
    this.server = new Server("https://horizon-live.stellar.org:1337");
    this.axiosMock = sinon.mock(HorizonAxiosClient);
    Config.setDefault();
  });

  afterEach(function() {
    this.axiosMock.verify();
    this.axiosMock.restore();
  });*/

  test("Create Account Op returns an empty array", async () => {
    const account = new Account(
      "GD6WU64OEP5C4LRBH6NK3MHYIA2ADN6K6II6EXPNVUR3ERBXT4AN4ACD",
      "2319149195853854",
    );

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.createAccount({
          destination:
            "GANO6WZFYZQ3UMD4HTCBQQSBTS2HJQCY7D4E5CXWVEQQSUOHUCQ7FUVD",
          startingBalance: "10",
        }),
      )
      .setTimeout(30)
      .build();

    try {
      const res = await getRegulatedAssetsInTx(
        tx,
        "https://horizon-live.stellar.org:1337",
      );
      expect(res).toEqual([]);
    } catch (e) {
      expect(e).toBe(null);
    }
  });

  test("Set Options Op returns an empty array", async () => {
    const account = new Account(
      "GD6WU64OEP5C4LRBH6NK3MHYIA2ADN6K6II6EXPNVUR3ERBXT4AN4ACD",
      "2319149195853854",
    );

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.setOptions({
          masterWeight: "20",
        }),
      )
      .setTimeout(30)
      .build();

    try {
      const res = await getRegulatedAssetsInTx(
        tx,
        "https://horizon-live.stellar.org:1337",
      );
      expect(res).toEqual([]);
    } catch (e) {
      expect(e).toBe(null);
    }
  });

  test("Change Trust Op returns an empty array", async () => {
    const account = new Account(
      "GD6WU64OEP5C4LRBH6NK3MHYIA2ADN6K6II6EXPNVUR3ERBXT4AN4ACD",
      "2319149195853854",
    );

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.changeTrust({
          asset: new Asset(
            "USD",
            "GDZYMFNEMBJZPWB7UXWI6DJQQN72QA34IPU3ISJT3ALH7AKQOF4PLOOL",
          ),
        }),
      )
      .setTimeout(30)
      .build();

    try {
      const res = await getRegulatedAssetsInTx(
        tx,
        "https://horizon-live.stellar.org:1337",
      );
      expect(res).toEqual([]);
    } catch (e) {
      expect(e).toBe(null);
    }
  });

  test("Allow Trust Op returns an empty array", async () => {
    const account = new Account(
      "GD6WU64OEP5C4LRBH6NK3MHYIA2ADN6K6II6EXPNVUR3ERBXT4AN4ACD",
      "2319149195853854",
    );

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.allowTrust({
          trustor: "GDZ7ZONQPEY5ZPPPLDC6DJGAK4UTLJEXT6WEZ67IJTLAATNIYQ2C5VZS",
          assetCode: "USD",
        }),
      )
      .setTimeout(30)
      .build();

    try {
      const res = await getRegulatedAssetsInTx(
        tx,
        "https://horizon-live.stellar.org:1337",
      );
      expect(res).toEqual([]);
    } catch (e) {
      expect(e).toBe(null);
    }
  });

  test("Account Merge Op returns an empty array", async () => {
    const account = new Account(
      "GD6WU64OEP5C4LRBH6NK3MHYIA2ADN6K6II6EXPNVUR3ERBXT4AN4ACD",
      "2319149195853854",
    );

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.accountMerge({
          destination:
            "GDZ7ZONQPEY5ZPPPLDC6DJGAK4UTLJEXT6WEZ67IJTLAATNIYQ2C5VZS",
        }),
      )
      .setTimeout(30)
      .build();

    try {
      const res = await getRegulatedAssetsInTx(
        tx,
        "https://horizon-live.stellar.org:1337",
      );
      expect(res).toEqual([]);
    } catch (e) {
      expect(e).toBe(null);
    }
  });

  test("Bump Sequence Op returns an empty array", async () => {
    const account = new Account(
      "GD6WU64OEP5C4LRBH6NK3MHYIA2ADN6K6II6EXPNVUR3ERBXT4AN4ACD",
      "2319149195853854",
    );

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.bumpSequence({
          bumpTo: "2319149195853856",
        }),
      )
      .setTimeout(30)
      .build();

    try {
      const res = await getRegulatedAssetsInTx(
        tx,
        "https://horizon-live.stellar.org:1337",
      );
      expect(res).toEqual([]);
    } catch (e) {
      expect(e).toBe(null);
    }
  });

  test("Manager Data Op returns an empty array", async () => {
    const account = new Account(
      "GD6WU64OEP5C4LRBH6NK3MHYIA2ADN6K6II6EXPNVUR3ERBXT4AN4ACD",
      "2319149195853854",
    );

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.manageData({
          name: "domain",
          value: "example.com",
        }),
      )
      .setTimeout(30)
      .build();

    try {
      const res = await getRegulatedAssetsInTx(
        tx,
        "https://horizon-live.stellar.org:1337",
      );
      expect(res).toEqual([]);
    } catch (e) {
      expect(e).toBe(null);
    }
  });

  test("Manager Data Op returns an empty array", async () => {
    const account = new Account(
      "GD6WU64OEP5C4LRBH6NK3MHYIA2ADN6K6II6EXPNVUR3ERBXT4AN4ACD",
      "2319149195853854",
    );

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.manageData({
          name: "domain",
          value: "example.com",
        }),
      )
      .setTimeout(30)
      .build();

    try {
      const res = await getRegulatedAssetsInTx(
        tx,
        "https://horizon-live.stellar.org:1337",
      );
      expect(res).toEqual([]);
    } catch (e) {
      expect(e).toBe(null);
    }
  });

  test("Begin Sponsoring Reserves Op returns an empty array", async () => {
    const account = new Account(
      "GD6WU64OEP5C4LRBH6NK3MHYIA2ADN6K6II6EXPNVUR3ERBXT4AN4ACD",
      "2319149195853854",
    );

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.beginSponsoringFutureReserves({
          sponsoredId:
            "GDZ7ZONQPEY5ZPPPLDC6DJGAK4UTLJEXT6WEZ67IJTLAATNIYQ2C5VZS",
        }),
      )
      .setTimeout(30)
      .build();

    try {
      const res = await getRegulatedAssetsInTx(
        tx,
        "https://horizon-live.stellar.org:1337",
      );
      expect(res).toEqual([]);
    } catch (e) {
      expect(e).toBe(null);
    }
  });

  test("End Sponsoring Future Reserves Op returns an empty array", async () => {
    const account = new Account(
      "GD6WU64OEP5C4LRBH6NK3MHYIA2ADN6K6II6EXPNVUR3ERBXT4AN4ACD",
      "2319149195853854",
    );

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(Operation.endSponsoringFutureReserves({}))
      .setTimeout(30)
      .build();

    try {
      const res = await getRegulatedAssetsInTx(
        tx,
        "https://horizon-live.stellar.org:1337",
      );
      expect(res).toEqual([]);
    } catch (e) {
      expect(e).toBe(null);
    }
  });

  test("Revoke Account Sponsorship Op returns an empty array", async () => {
    const account = new Account(
      "GD6WU64OEP5C4LRBH6NK3MHYIA2ADN6K6II6EXPNVUR3ERBXT4AN4ACD",
      "2319149195853854",
    );

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.revokeAccountSponsorship({
          account: "GDZ7ZONQPEY5ZPPPLDC6DJGAK4UTLJEXT6WEZ67IJTLAATNIYQ2C5VZS",
        }),
      )
      .setTimeout(30)
      .build();

    try {
      const res = await getRegulatedAssetsInTx(
        tx,
        "https://horizon-live.stellar.org:1337",
      );
      expect(res).toEqual([]);
    } catch (e) {
      expect(e).toBe(null);
    }
  });

  test("Revoke Trustline Sponsorship Op returns an empty array", async () => {
    const account = new Account(
      "GD6WU64OEP5C4LRBH6NK3MHYIA2ADN6K6II6EXPNVUR3ERBXT4AN4ACD",
      "2319149195853854",
    );

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.revokeTrustlineSponsorship({
          account: "GDZ7ZONQPEY5ZPPPLDC6DJGAK4UTLJEXT6WEZ67IJTLAATNIYQ2C5VZS",
          asset: new Asset(
            "USD",
            "GDZYMFNEMBJZPWB7UXWI6DJQQN72QA34IPU3ISJT3ALH7AKQOF4PLOOL",
          ),
        }),
      )
      .setTimeout(30)
      .build();

    try {
      const res = await getRegulatedAssetsInTx(
        tx,
        "https://horizon-live.stellar.org:1337",
      );
      expect(res).toEqual([]);
    } catch (e) {
      expect(e).toBe(null);
    }
  });

  test("Revoke Offer Sponsorship Op returns an empty array", async () => {
    const account = new Account(
      "GD6WU64OEP5C4LRBH6NK3MHYIA2ADN6K6II6EXPNVUR3ERBXT4AN4ACD",
      "2319149195853854",
    );

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.revokeOfferSponsorship({
          seller: "GDZYMFNEMBJZPWB7UXWI6DJQQN72QA34IPU3ISJT3ALH7AKQOF4PLOOL",
          offerId: "123",
        }),
      )
      .setTimeout(30)
      .build();

    try {
      const res = await getRegulatedAssetsInTx(
        tx,
        "https://horizon-live.stellar.org:1337",
      );
      expect(res).toEqual([]);
    } catch (e) {
      expect(e).toBe(null);
    }
  });

  test("Revoke Data Sponsorship Op returns an empty array", async () => {
    const account = new Account(
      "GD6WU64OEP5C4LRBH6NK3MHYIA2ADN6K6II6EXPNVUR3ERBXT4AN4ACD",
      "2319149195853854",
    );

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.revokeDataSponsorship({
          account: "GDZYMFNEMBJZPWB7UXWI6DJQQN72QA34IPU3ISJT3ALH7AKQOF4PLOOL",
          name: "domain",
        }),
      )
      .setTimeout(30)
      .build();

    try {
      const res = await getRegulatedAssetsInTx(
        tx,
        "https://horizon-live.stellar.org:1337",
      );
      expect(res).toEqual([]);
    } catch (e) {
      expect(e).toBe(null);
    }
  });

  test("Revoke Signer Sponsorship Op returns an empty array", async () => {
    const account = new Account(
      "GD6WU64OEP5C4LRBH6NK3MHYIA2ADN6K6II6EXPNVUR3ERBXT4AN4ACD",
      "2319149195853854",
    );

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.revokeSignerSponsorship({
          account: "GDZYMFNEMBJZPWB7UXWI6DJQQN72QA34IPU3ISJT3ALH7AKQOF4PLOOL",
          signer: {
            ed25519PublicKey:
              "GA4ZFPCCOP3YXAZHPLTO2Y45IFPZFPYTEBGXXUOAHG75OCANU3IIPZZT",
          },
        }),
      )
      .setTimeout(30)
      .build();

    try {
      const res = await getRegulatedAssetsInTx(
        tx,
        "https://horizon-live.stellar.org:1337",
      );
      expect(res).toEqual([]);
    } catch (e) {
      expect(e).toBe(null);
    }
  });
});
