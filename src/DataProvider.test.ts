import MockAdapter from "axios-mock-adapter";
import BigNumber from "bignumber.js";
import StellarSdk from "stellar-sdk";

import { DataProvider } from "./DataProvider";
import { AccountResponse } from "./fixtures/AccountResponse";

const HorizonUrl = "https://horizon-live.stellar.org:1337";
const publicKey = "PHYREXIA";

describe("getbalancesForAccount", () => {
  let axiosMockAdapter: MockAdapter;
  let dataProvider: DataProvider;

  beforeEach(() => {
    axiosMockAdapter = new MockAdapter(StellarSdk.HorizonAxiosClient);
    dataProvider = new DataProvider(HorizonUrl);
  });

  afterEach(() => {
    axiosMockAdapter.restore();
  });

  it("makes balances from a real-world example", async () => {
    axiosMockAdapter
      .onGet(`${HorizonUrl}/accounts/${publicKey}`)
      .reply(200, AccountResponse);

    const balances = await dataProvider.getBalancesForAccount(publicKey);

    expect(balances).toEqual({
      "BAT:GBDEVU63Y6NTHJQQZIKVTC23NWLQVP3WJ2RI2OTSJTNYOIGICST6DUXR": {
        balance: new BigNumber("0.0000000"),
        limit: new BigNumber("922337203685.4775807"),
        buying_liabilities: new BigNumber("0.0000000"),
        selling_liabilities: new BigNumber("0.0000000"),
        last_modified_ledger: 22897214,
        token: {
          type: "credit_alphanum4",
          code: "BAT",
          issuer: {
            publicKey:
              "GBDEVU63Y6NTHJQQZIKVTC23NWLQVP3WJ2RI2OTSJTNYOIGICST6DUXR",
          },
        },
      },
      "REPO:GCZNF24HPMYTV6NOEHI7Q5RJFFUI23JKUKY3H3XTQAFBQIBOHD5OXG3B": {
        balance: new BigNumber("19.0000000"),
        limit: new BigNumber("922337203685.4775807"),
        buying_liabilities: new BigNumber("0.0000000"),
        selling_liabilities: new BigNumber("0.0000000"),
        last_modified_ledger: 19145605,
        token: {
          type: "credit_alphanum4",
          code: "REPO",
          issuer: {
            publicKey:
              "GCZNF24HPMYTV6NOEHI7Q5RJFFUI23JKUKY3H3XTQAFBQIBOHD5OXG3B",
          },
        },
      },
      "TERN:GDGQDVO6XPFSY4NMX75A7AOVYCF5JYGW2SHCJJNWCQWIDGOZB53DGP6C": {
        balance: new BigNumber("10.0000000"),
        limit: new BigNumber("922337203685.4775807"),
        buying_liabilities: new BigNumber("0.0000000"),
        selling_liabilities: new BigNumber("0.0000000"),
        last_modified_ledger: 18902253,
        token: {
          type: "credit_alphanum4",
          code: "TERN",
          issuer: {
            publicKey:
              "GDGQDVO6XPFSY4NMX75A7AOVYCF5JYGW2SHCJJNWCQWIDGOZB53DGP6C",
          },
        },
      },
      "WSD:GDSVWEA7XV6M5XNLODVTPCGMAJTNBLZBXOFNQD3BNPNYALEYBNT6CE2V": {
        balance: new BigNumber("0.0000000"),
        limit: new BigNumber("922337203685.4775807"),
        buying_liabilities: new BigNumber("0.0000000"),
        selling_liabilities: new BigNumber("0.0000000"),
        last_modified_ledger: 22718536,
        token: {
          type: "credit_alphanum4",
          code: "WSD",
          issuer: {
            publicKey:
              "GDSVWEA7XV6M5XNLODVTPCGMAJTNBLZBXOFNQD3BNPNYALEYBNT6CE2V",
          },
        },
      },
      "USD:GDUKMGUGDZQK6YHYA5Z6AY2G4XDSZPSZ3SW5UN3ARVMO6QSRDWP5YLEX": {
        balance: new BigNumber("1.0000000"),
        limit: new BigNumber("922337203685.4775807"),
        buying_liabilities: new BigNumber("0.0000000"),
        selling_liabilities: new BigNumber("0.0000000"),
        last_modified_ledger: 22721290,
        token: {
          type: "credit_alphanum4",
          code: "USD",
          issuer: {
            publicKey:
              "GDUKMGUGDZQK6YHYA5Z6AY2G4XDSZPSZ3SW5UN3ARVMO6QSRDWP5YLEX",
          },
        },
      },
      "native": {
        balance: "999.5689234",
        buying_liabilities: "0.0000000",
        selling_liabilities: "0.0000000",

        token: {
          type: "native",
          code: "XLM",
        },
      },
    });
  });
});
