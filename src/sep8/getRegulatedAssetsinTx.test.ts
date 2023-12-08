import {
  Account,
  Asset,
  BASE_FEE,
  Claimant,
  Config,
  Horizon,
  Networks,
  Operation,
  TransactionBuilder,
} from "@stellar/stellar-sdk";
import sinon from "sinon";
import { getRegulatedAssetsInTx } from "./getRegulatedAssetsInTx";

describe("getRegulatedAssetsInTx with no ops moving assets", () => {
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

  test("Revoke Claimable Balance Sponsorship Op", async () => {
    const account = new Account(
      "GD6WU64OEP5C4LRBH6NK3MHYIA2ADN6K6II6EXPNVUR3ERBXT4AN4ACD",
      "2319149195853854",
    );

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.revokeClaimableBalanceSponsorship({
          balanceId:
            "00000000929b20b72e5890ab51c24f1cc46fa01c4f318d8d33367d24dd614cfd" +
            "f5491072",
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

function buildAccountResponse(
  id: string,
  authRequired: boolean,
  authRevocable: boolean,
  homeDomain: string = "example.com",
) {
  return {
    _links: {},
    id,
    account_id: id,
    sequence: "3298702387052545",
    home_domain: homeDomain,
    subentry_count: 1,
    last_modified_ledger: 768061,
    thresholds: {
      low_threshold: 0,
      med_threshold: 0,
      high_threshold: 0,
    },
    flags: {
      auth_required: authRequired,
      auth_revocable: authRevocable,
      auth_immutable: false,
    },
    balances: [
      {
        balance: "9999.9999900",
        buying_liabilities: "0.0000000",
        selling_liabilities: "0.0000000",
        asset_type: "native",
      },
    ],
    signers: [
      {
        weight: 1,
        key: id,
        type: "ed25519_public_key",
      },
    ],
    data: {},
  };
}

describe.skip("getRegulatedAssetsInTx with ops moving regulated assets", () => {
  let axiosMock: sinon.SinonMock;

  beforeEach(() => {
    axiosMock = sinon.mock(Horizon.AxiosClient);
    Config.setDefault();
  });

  afterEach(() => {
    axiosMock.verify();
    axiosMock.restore();
  });

  test("Payment Op", async () => {
    const account = new Account(
      "GD6WU64OEP5C4LRBH6NK3MHYIA2ADN6K6II6EXPNVUR3ERBXT4AN4ACD",
      "2319149195853854",
    );

    const raIssuer = "GB2MIGFFC7IIEVAJ4OHTEH3GDLIEFE3K2RYLT3LPGZEKDDAH4FL3FPSJ";
    const homeDomain = "https://regulated-asset-issuer-home-domain.com";
    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.payment({
          amount: "10",
          asset: new Asset("USD", raIssuer),
          destination:
            "GANO6WZFYZQ3UMD4HTCBQQSBTS2HJQCY7D4E5CXWVEQQSUOHUCQ7FUVD",
        }),
      )
      .setTimeout(30)
      .build();

    axiosMock
      .expects("get")
      .withArgs(
        sinon.match(
          `https://horizon-live.stellar.org:1337/accounts/${raIssuer}`,
        ),
      )
      .returns(
        Promise.resolve({
          data: buildAccountResponse(raIssuer, true, true, homeDomain),
        }),
      );

    try {
      const res = await getRegulatedAssetsInTx(
        tx,
        "https://horizon-live.stellar.org:1337",
      );
      expect(res).toEqual([
        { asset_code: "USD", asset_issuer: raIssuer, home_domain: homeDomain },
      ]);
    } catch (e) {
      expect(e).toBe(null);
    }
  });

  test("Path Payment Strict Receive Op", async () => {
    const account = new Account(
      "GD6WU64OEP5C4LRBH6NK3MHYIA2ADN6K6II6EXPNVUR3ERBXT4AN4ACD",
      "2319149195853854",
    );

    const raIssuer = "GB2MIGFFC7IIEVAJ4OHTEH3GDLIEFE3K2RYLT3LPGZEKDDAH4FL3FPSJ";
    const homeDomain = "https://regulated-asset-issuer-home-domain.com";
    const issuer = "GD4BA2IQA6RIRCCI6AAG6IMVLYTMBSWCFKFGZAFPFMWNJFP7DM2T4HU6";
    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.pathPaymentStrictReceive({
          sendMax: "10",
          sendAsset: new Asset("USD", raIssuer),
          destAsset: new Asset("EUR", issuer),
          destAmount: "10",
          destination:
            "GANO6WZFYZQ3UMD4HTCBQQSBTS2HJQCY7D4E5CXWVEQQSUOHUCQ7FUVD",
        }),
      )
      .setTimeout(30)
      .build();

    axiosMock
      .expects("get")
      .withArgs(
        sinon.match(
          `https://horizon-live.stellar.org:1337/accounts/${raIssuer}`,
        ),
      )
      .returns(
        Promise.resolve({
          data: buildAccountResponse(raIssuer, true, true, homeDomain),
        }),
      );

    axiosMock
      .expects("get")
      .withArgs(
        sinon.match(`https://horizon-live.stellar.org:1337/accounts/${issuer}`),
      )
      .returns(
        Promise.resolve({ data: buildAccountResponse(issuer, false, false) }),
      );

    try {
      const res = await getRegulatedAssetsInTx(
        tx,
        "https://horizon-live.stellar.org:1337",
      );
      expect(res).toEqual([
        { asset_code: "USD", asset_issuer: raIssuer, home_domain: homeDomain },
      ]);
    } catch (e) {
      expect(e).toBe(null);
    }
  });

  test("Path Payment Strict Send Op", async () => {
    const account = new Account(
      "GD6WU64OEP5C4LRBH6NK3MHYIA2ADN6K6II6EXPNVUR3ERBXT4AN4ACD",
      "2319149195853854",
    );

    const raIssuer = "GB2MIGFFC7IIEVAJ4OHTEH3GDLIEFE3K2RYLT3LPGZEKDDAH4FL3FPSJ";
    const homeDomain = "https://regulated-asset-issuer-home-domain.com";
    const issuer = "GD4BA2IQA6RIRCCI6AAG6IMVLYTMBSWCFKFGZAFPFMWNJFP7DM2T4HU6";
    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.pathPaymentStrictSend({
          sendAmount: "10",
          sendAsset: new Asset("USD", raIssuer),
          destAsset: new Asset("EUR", issuer),
          destMin: "10",
          destination:
            "GANO6WZFYZQ3UMD4HTCBQQSBTS2HJQCY7D4E5CXWVEQQSUOHUCQ7FUVD",
        }),
      )
      .setTimeout(30)
      .build();

    axiosMock
      .expects("get")
      .withArgs(
        sinon.match(
          `https://horizon-live.stellar.org:1337/accounts/${raIssuer}`,
        ),
      )
      .returns(
        Promise.resolve({
          data: buildAccountResponse(raIssuer, true, true, homeDomain),
        }),
      );

    axiosMock
      .expects("get")
      .withArgs(
        sinon.match(`https://horizon-live.stellar.org:1337/accounts/${issuer}`),
      )
      .returns(
        Promise.resolve({ data: buildAccountResponse(issuer, false, false) }),
      );

    try {
      const res = await getRegulatedAssetsInTx(
        tx,
        "https://horizon-live.stellar.org:1337",
      );
      expect(res).toEqual([
        { asset_code: "USD", asset_issuer: raIssuer, home_domain: homeDomain },
      ]);
    } catch (e) {
      expect(e).toBe(null);
    }
  });

  test("Create Passive Sell Offer Op", async () => {
    const account = new Account(
      "GD6WU64OEP5C4LRBH6NK3MHYIA2ADN6K6II6EXPNVUR3ERBXT4AN4ACD",
      "2319149195853854",
    );

    const raIssuer = "GB2MIGFFC7IIEVAJ4OHTEH3GDLIEFE3K2RYLT3LPGZEKDDAH4FL3FPSJ";
    const homeDomain = "https://regulated-asset-issuer-home-domain.com";
    const issuer = "GD4BA2IQA6RIRCCI6AAG6IMVLYTMBSWCFKFGZAFPFMWNJFP7DM2T4HU6";
    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.createPassiveSellOffer({
          amount: "10",
          selling: new Asset("USD", raIssuer),
          buying: new Asset("EUR", issuer),
          price: "10",
        }),
      )
      .setTimeout(30)
      .build();

    axiosMock
      .expects("get")
      .withArgs(
        sinon.match(
          `https://horizon-live.stellar.org:1337/accounts/${raIssuer}`,
        ),
      )
      .returns(
        Promise.resolve({
          data: buildAccountResponse(raIssuer, true, true, homeDomain),
        }),
      );

    axiosMock
      .expects("get")
      .withArgs(
        sinon.match(`https://horizon-live.stellar.org:1337/accounts/${issuer}`),
      )
      .returns(
        Promise.resolve({ data: buildAccountResponse(issuer, false, false) }),
      );

    try {
      const res = await getRegulatedAssetsInTx(
        tx,
        "https://horizon-live.stellar.org:1337",
      );
      expect(res).toEqual([
        { asset_code: "USD", asset_issuer: raIssuer, home_domain: homeDomain },
      ]);
    } catch (e) {
      expect(e).toBe(null);
    }
  });

  test("Manage Sell Offer Op", async () => {
    const account = new Account(
      "GD6WU64OEP5C4LRBH6NK3MHYIA2ADN6K6II6EXPNVUR3ERBXT4AN4ACD",
      "2319149195853854",
    );

    const raIssuer = "GB2MIGFFC7IIEVAJ4OHTEH3GDLIEFE3K2RYLT3LPGZEKDDAH4FL3FPSJ";
    const homeDomain = "https://regulated-asset-issuer-home-domain.com";
    const issuer = "GD4BA2IQA6RIRCCI6AAG6IMVLYTMBSWCFKFGZAFPFMWNJFP7DM2T4HU6";
    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.manageSellOffer({
          amount: "10",
          selling: new Asset("USD", raIssuer),
          buying: new Asset("EUR", issuer),
          price: "10",
        }),
      )
      .setTimeout(30)
      .build();

    axiosMock
      .expects("get")
      .withArgs(
        sinon.match(
          `https://horizon-live.stellar.org:1337/accounts/${raIssuer}`,
        ),
      )
      .returns(
        Promise.resolve({
          data: buildAccountResponse(raIssuer, true, true, homeDomain),
        }),
      );

    axiosMock
      .expects("get")
      .withArgs(
        sinon.match(`https://horizon-live.stellar.org:1337/accounts/${issuer}`),
      )
      .returns(
        Promise.resolve({ data: buildAccountResponse(issuer, false, false) }),
      );

    try {
      const res = await getRegulatedAssetsInTx(
        tx,
        "https://horizon-live.stellar.org:1337",
      );
      expect(res).toEqual([
        { asset_code: "USD", asset_issuer: raIssuer, home_domain: homeDomain },
      ]);
    } catch (e) {
      expect(e).toBe(null);
    }
  });

  test("Manage Buy Offer Op", async () => {
    const account = new Account(
      "GD6WU64OEP5C4LRBH6NK3MHYIA2ADN6K6II6EXPNVUR3ERBXT4AN4ACD",
      "2319149195853854",
    );

    const raIssuer = "GB2MIGFFC7IIEVAJ4OHTEH3GDLIEFE3K2RYLT3LPGZEKDDAH4FL3FPSJ";
    const homeDomain = "https://regulated-asset-issuer-home-domain.com";
    const issuer = "GD4BA2IQA6RIRCCI6AAG6IMVLYTMBSWCFKFGZAFPFMWNJFP7DM2T4HU6";
    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.manageBuyOffer({
          buyAmount: "10",
          selling: new Asset("USD", raIssuer),
          buying: new Asset("EUR", issuer),
          price: "10",
        }),
      )
      .setTimeout(30)
      .build();

    axiosMock
      .expects("get")
      .withArgs(
        sinon.match(
          `https://horizon-live.stellar.org:1337/accounts/${raIssuer}`,
        ),
      )
      .returns(
        Promise.resolve({
          data: buildAccountResponse(raIssuer, true, true, homeDomain),
        }),
      );

    axiosMock
      .expects("get")
      .withArgs(
        sinon.match(`https://horizon-live.stellar.org:1337/accounts/${issuer}`),
      )
      .returns(
        Promise.resolve({ data: buildAccountResponse(issuer, false, false) }),
      );

    try {
      const res = await getRegulatedAssetsInTx(
        tx,
        "https://horizon-live.stellar.org:1337",
      );
      expect(res).toEqual([
        { asset_code: "USD", asset_issuer: raIssuer, home_domain: homeDomain },
      ]);
    } catch (e) {
      expect(e).toBe(null);
    }
  });

  test("Create Claimable Balance Op", async () => {
    const account = new Account(
      "GD6WU64OEP5C4LRBH6NK3MHYIA2ADN6K6II6EXPNVUR3ERBXT4AN4ACD",
      "2319149195853854",
    );

    const raIssuer = "GB2MIGFFC7IIEVAJ4OHTEH3GDLIEFE3K2RYLT3LPGZEKDDAH4FL3FPSJ";
    const homeDomain = "https://regulated-asset-issuer-home-domain.com";
    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.createClaimableBalance({
          amount: "10",
          asset: new Asset("USD", raIssuer),
          claimants: [
            new Claimant(
              "GD4BA2IQA6RIRCCI6AAG6IMVLYTMBSWCFKFGZAFPFMWNJFP7DM2T4HU6",
            ),
          ],
        }),
      )
      .setTimeout(30)
      .build();

    axiosMock
      .expects("get")
      .withArgs(
        sinon.match(
          `https://horizon-live.stellar.org:1337/accounts/${raIssuer}`,
        ),
      )
      .returns(
        Promise.resolve({
          data: buildAccountResponse(raIssuer, true, true, homeDomain),
        }),
      );

    try {
      const res = await getRegulatedAssetsInTx(
        tx,
        "https://horizon-live.stellar.org:1337",
      );
      expect(res).toEqual([
        { asset_code: "USD", asset_issuer: raIssuer, home_domain: homeDomain },
      ]);
    } catch (e) {
      expect(e).toBe(null);
    }
  });

  test("Claim Claimable Balance Op", async () => {
    const account = new Account(
      "GD6WU64OEP5C4LRBH6NK3MHYIA2ADN6K6II6EXPNVUR3ERBXT4AN4ACD",
      "2319149195853854",
    );

    const raIssuer = "GB2MIGFFC7IIEVAJ4OHTEH3GDLIEFE3K2RYLT3LPGZEKDDAH4FL3FPSJ";
    const homeDomain = "https://regulated-asset-issuer-home-domain.com";
    const balanceId =
      "00000000929b20b72e5890ab51c24f1cc46fa01c4f318d8d33367d24dd614cfdf54910" +
      "72";
    const balanceResponse = {
      _links: {},
      id: balanceId,
      asset: `USD:${raIssuer}`,
      amount: "200.0000000",
      sponsor: "GBVFLWXYCIGPO3455XVFIKHS66FCT5AI64ZARKS7QJN4NF7K5FOXTJNL",
      last_modified_ledger: 38888,
      claimants: [
        {
          destination:
            "GBVFLWXYCIGPO3455XVFIKHS66FCT5AI64ZARKS7QJN4NF7K5FOXTJNL",
          predicate: {
            unconditional: true,
          },
        },
      ],
      paging_token: "",
    };

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.claimClaimableBalance({
          balanceId,
        }),
      )
      .setTimeout(30)
      .build();

    axiosMock
      .expects("get")
      .withArgs(
        sinon.match(
          `https://horizon-live.stellar.org:1337/claimable_balances/` +
            `${balanceId}`,
        ),
      )
      .returns(Promise.resolve({ data: balanceResponse }));

    axiosMock
      .expects("get")
      .withArgs(
        sinon.match(
          `https://horizon-live.stellar.org:1337/accounts/${raIssuer}`,
        ),
      )
      .returns(
        Promise.resolve({
          data: buildAccountResponse(raIssuer, true, true, homeDomain),
        }),
      );

    try {
      const res = await getRegulatedAssetsInTx(
        tx,
        "https://horizon-live.stellar.org:1337",
      );
      expect(res).toEqual([
        { asset_code: "USD", asset_issuer: raIssuer, home_domain: homeDomain },
      ]);
    } catch (e) {
      expect(e).toBe(null);
    }
  });
});

describe("getRegulatedAssetsInTx with ops moving nonregulated assets", () => {
  let axiosMock: sinon.SinonMock;

  beforeEach(() => {
    axiosMock = sinon.mock(Horizon.AxiosClient);
    Config.setDefault();
  });

  afterEach(() => {
    axiosMock.verify();
    axiosMock.restore();
  });

  test("Payment Op", async () => {
    const account = new Account(
      "GD6WU64OEP5C4LRBH6NK3MHYIA2ADN6K6II6EXPNVUR3ERBXT4AN4ACD",
      "2319149195853854",
    );

    const usdIssuer =
      "GB2MIGFFC7IIEVAJ4OHTEH3GDLIEFE3K2RYLT3LPGZEKDDAH4FL3FPSJ";
    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.payment({
          amount: "10",
          asset: new Asset("USD", usdIssuer),
          destination:
            "GANO6WZFYZQ3UMD4HTCBQQSBTS2HJQCY7D4E5CXWVEQQSUOHUCQ7FUVD",
        }),
      )
      .setTimeout(30)
      .build();

    axiosMock
      .expects("get")
      .withArgs(
        sinon.match(
          `https://horizon-live.stellar.org:1337/accounts/${usdIssuer}`,
        ),
      )
      .returns(
        Promise.resolve({
          data: buildAccountResponse(usdIssuer, false, false),
        }),
      );

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

  test("Path Payment Strict Receive Op", async () => {
    const account = new Account(
      "GD6WU64OEP5C4LRBH6NK3MHYIA2ADN6K6II6EXPNVUR3ERBXT4AN4ACD",
      "2319149195853854",
    );

    const usdIssuer =
      "GB2MIGFFC7IIEVAJ4OHTEH3GDLIEFE3K2RYLT3LPGZEKDDAH4FL3FPSJ";
    const eurIssuer =
      "GD4BA2IQA6RIRCCI6AAG6IMVLYTMBSWCFKFGZAFPFMWNJFP7DM2T4HU6";
    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.pathPaymentStrictReceive({
          sendMax: "10",
          sendAsset: new Asset("USD", usdIssuer),
          destAsset: new Asset("EUR", eurIssuer),
          destAmount: "10",
          destination:
            "GANO6WZFYZQ3UMD4HTCBQQSBTS2HJQCY7D4E5CXWVEQQSUOHUCQ7FUVD",
        }),
      )
      .setTimeout(30)
      .build();

    axiosMock
      .expects("get")
      .withArgs(
        sinon.match(
          `https://horizon-live.stellar.org:1337/accounts/${usdIssuer}`,
        ),
      )
      .returns(
        Promise.resolve({
          data: buildAccountResponse(usdIssuer, false, false),
        }),
      );

    axiosMock
      .expects("get")
      .withArgs(
        sinon.match(
          `https://horizon-live.stellar.org:1337/accounts/${eurIssuer}`,
        ),
      )
      .returns(
        Promise.resolve({
          data: buildAccountResponse(eurIssuer, false, false),
        }),
      );

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

  test("Path Payment Strict Send Op", async () => {
    const account = new Account(
      "GD6WU64OEP5C4LRBH6NK3MHYIA2ADN6K6II6EXPNVUR3ERBXT4AN4ACD",
      "2319149195853854",
    );

    const usdIssuer =
      "GB2MIGFFC7IIEVAJ4OHTEH3GDLIEFE3K2RYLT3LPGZEKDDAH4FL3FPSJ";
    const eurIssuer =
      "GD4BA2IQA6RIRCCI6AAG6IMVLYTMBSWCFKFGZAFPFMWNJFP7DM2T4HU6";
    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.pathPaymentStrictSend({
          sendAmount: "10",
          sendAsset: new Asset("USD", usdIssuer),
          destAsset: new Asset("EUR", eurIssuer),
          destMin: "10",
          destination:
            "GANO6WZFYZQ3UMD4HTCBQQSBTS2HJQCY7D4E5CXWVEQQSUOHUCQ7FUVD",
        }),
      )
      .setTimeout(30)
      .build();

    axiosMock
      .expects("get")
      .withArgs(
        sinon.match(
          `https://horizon-live.stellar.org:1337/accounts/${usdIssuer}`,
        ),
      )
      .returns(
        Promise.resolve({
          data: buildAccountResponse(usdIssuer, false, false),
        }),
      );

    axiosMock
      .expects("get")
      .withArgs(
        sinon.match(
          `https://horizon-live.stellar.org:1337/accounts/${eurIssuer}`,
        ),
      )
      .returns(
        Promise.resolve({
          data: buildAccountResponse(eurIssuer, false, false),
        }),
      );

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

  test("Create Passive Sell Offer Op", async () => {
    const account = new Account(
      "GD6WU64OEP5C4LRBH6NK3MHYIA2ADN6K6II6EXPNVUR3ERBXT4AN4ACD",
      "2319149195853854",
    );

    const usdIssuer =
      "GB2MIGFFC7IIEVAJ4OHTEH3GDLIEFE3K2RYLT3LPGZEKDDAH4FL3FPSJ";
    const eurIssuer =
      "GD4BA2IQA6RIRCCI6AAG6IMVLYTMBSWCFKFGZAFPFMWNJFP7DM2T4HU6";
    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.createPassiveSellOffer({
          amount: "10",
          selling: new Asset("USD", usdIssuer),
          buying: new Asset("EUR", eurIssuer),
          price: "10",
        }),
      )
      .setTimeout(30)
      .build();

    axiosMock
      .expects("get")
      .withArgs(
        sinon.match(
          `https://horizon-live.stellar.org:1337/accounts/${usdIssuer}`,
        ),
      )
      .returns(
        Promise.resolve({
          data: buildAccountResponse(usdIssuer, false, false),
        }),
      );

    axiosMock
      .expects("get")
      .withArgs(
        sinon.match(
          `https://horizon-live.stellar.org:1337/accounts/${eurIssuer}`,
        ),
      )
      .returns(
        Promise.resolve({
          data: buildAccountResponse(eurIssuer, false, false),
        }),
      );

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

  test("Manage Sell Offer Op", async () => {
    const account = new Account(
      "GD6WU64OEP5C4LRBH6NK3MHYIA2ADN6K6II6EXPNVUR3ERBXT4AN4ACD",
      "2319149195853854",
    );

    const usdIssuer =
      "GB2MIGFFC7IIEVAJ4OHTEH3GDLIEFE3K2RYLT3LPGZEKDDAH4FL3FPSJ";
    const eurIssuer =
      "GD4BA2IQA6RIRCCI6AAG6IMVLYTMBSWCFKFGZAFPFMWNJFP7DM2T4HU6";
    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.manageSellOffer({
          amount: "10",
          selling: new Asset("USD", usdIssuer),
          buying: new Asset("EUR", eurIssuer),
          price: "10",
        }),
      )
      .setTimeout(30)
      .build();

    axiosMock
      .expects("get")
      .withArgs(
        sinon.match(
          `https://horizon-live.stellar.org:1337/accounts/${usdIssuer}`,
        ),
      )
      .returns(
        Promise.resolve({
          data: buildAccountResponse(usdIssuer, false, false),
        }),
      );

    axiosMock
      .expects("get")
      .withArgs(
        sinon.match(
          `https://horizon-live.stellar.org:1337/accounts/${eurIssuer}`,
        ),
      )
      .returns(
        Promise.resolve({
          data: buildAccountResponse(eurIssuer, false, false),
        }),
      );

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

  test("Manage Buy Offer Op", async () => {
    const account = new Account(
      "GD6WU64OEP5C4LRBH6NK3MHYIA2ADN6K6II6EXPNVUR3ERBXT4AN4ACD",
      "2319149195853854",
    );

    const usdIssuer =
      "GB2MIGFFC7IIEVAJ4OHTEH3GDLIEFE3K2RYLT3LPGZEKDDAH4FL3FPSJ";
    const eurIssuer =
      "GD4BA2IQA6RIRCCI6AAG6IMVLYTMBSWCFKFGZAFPFMWNJFP7DM2T4HU6";
    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.manageBuyOffer({
          buyAmount: "10",
          selling: new Asset("USD", usdIssuer),
          buying: new Asset("EUR", eurIssuer),
          price: "10",
        }),
      )
      .setTimeout(30)
      .build();

    axiosMock
      .expects("get")
      .withArgs(
        sinon.match(
          `https://horizon-live.stellar.org:1337/accounts/${usdIssuer}`,
        ),
      )
      .returns(
        Promise.resolve({
          data: buildAccountResponse(usdIssuer, false, false),
        }),
      );

    axiosMock
      .expects("get")
      .withArgs(
        sinon.match(
          `https://horizon-live.stellar.org:1337/accounts/${eurIssuer}`,
        ),
      )
      .returns(
        Promise.resolve({
          data: buildAccountResponse(eurIssuer, false, false),
        }),
      );

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

  test("Create Claimable Balance Op", async () => {
    const account = new Account(
      "GD6WU64OEP5C4LRBH6NK3MHYIA2ADN6K6II6EXPNVUR3ERBXT4AN4ACD",
      "2319149195853854",
    );

    const usdIssuer =
      "GB2MIGFFC7IIEVAJ4OHTEH3GDLIEFE3K2RYLT3LPGZEKDDAH4FL3FPSJ";
    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.createClaimableBalance({
          amount: "10",
          asset: new Asset("USD", usdIssuer),
          claimants: [
            new Claimant(
              "GD4BA2IQA6RIRCCI6AAG6IMVLYTMBSWCFKFGZAFPFMWNJFP7DM2T4HU6",
            ),
          ],
        }),
      )
      .setTimeout(30)
      .build();

    axiosMock
      .expects("get")
      .withArgs(
        sinon.match(
          `https://horizon-live.stellar.org:1337/accounts/${usdIssuer}`,
        ),
      )
      .returns(
        Promise.resolve({
          data: buildAccountResponse(usdIssuer, false, false),
        }),
      );

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

  test("Claim Claimable Balance Op", async () => {
    const account = new Account(
      "GD6WU64OEP5C4LRBH6NK3MHYIA2ADN6K6II6EXPNVUR3ERBXT4AN4ACD",
      "2319149195853854",
    );

    const usdIssuer =
      "GB2MIGFFC7IIEVAJ4OHTEH3GDLIEFE3K2RYLT3LPGZEKDDAH4FL3FPSJ";
    const balanceId =
      "00000000929b20b72e5890ab51c24f1cc46fa01c4f318d8d33367d24dd614cfdf54910" +
      "72";
    const balanceResponse = {
      _links: {},
      id: balanceId,
      asset: `USD:${usdIssuer}`,
      amount: "200.0000000",
      sponsor: "GBVFLWXYCIGPO3455XVFIKHS66FCT5AI64ZARKS7QJN4NF7K5FOXTJNL",
      last_modified_ledger: 38888,
      claimants: [
        {
          destination:
            "GBVFLWXYCIGPO3455XVFIKHS66FCT5AI64ZARKS7QJN4NF7K5FOXTJNL",
          predicate: {
            unconditional: true,
          },
        },
      ],
      paging_token: "",
    };

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.claimClaimableBalance({
          balanceId,
        }),
      )
      .setTimeout(30)
      .build();

    axiosMock
      .expects("get")
      .withArgs(
        sinon.match(
          `https://horizon-live.stellar.org:1337/claimable_balances/` +
            `${balanceId}`,
        ),
      )
      .returns(Promise.resolve({ data: balanceResponse }));

    axiosMock
      .expects("get")
      .withArgs(
        sinon.match(
          `https://horizon-live.stellar.org:1337/accounts/${usdIssuer}`,
        ),
      )
      .returns(
        Promise.resolve({
          data: buildAccountResponse(usdIssuer, false, false),
        }),
      );

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
