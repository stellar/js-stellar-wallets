import BigNumber from "bignumber.js";

import { AccountResponse } from "../fixtures/AccountResponse";
import { parseResponse } from "../testUtils";

import { makeDisplayableBalances } from "./makeDisplayableBalances";

it("makes balances from a real-world example", async () => {
  // @ts-ignore
  const balances = makeDisplayableBalances(parseResponse(AccountResponse));

  expect(balances).toEqual({
    "BAT:GBDEVU63Y6NTHJQQZIKVTC23NWLQVP3WJ2RI2OTSJTNYOIGICST6DUXR": {
      available: new BigNumber("0.0000000"),
      total: new BigNumber("0.0000000"),
      limit: new BigNumber("922337203685.4775807"),
      buyingLiabilities: new BigNumber("0.0000000"),
      sellingLiabilities: new BigNumber("0.0000000"),
      lastModified: 22897214,
      token: {
        type: "credit_alphanum4",
        code: "BAT",
        issuer: {
          publicKey: "GBDEVU63Y6NTHJQQZIKVTC23NWLQVP3WJ2RI2OTSJTNYOIGICST6DUXR",
        },
      },
    },
    "REPO:GCZNF24HPMYTV6NOEHI7Q5RJFFUI23JKUKY3H3XTQAFBQIBOHD5OXG3B": {
      available: new BigNumber("19.0000000"),
      total: new BigNumber("19.0000000"),
      limit: new BigNumber("922337203685.4775807"),
      buyingLiabilities: new BigNumber("0.0000000"),
      sellingLiabilities: new BigNumber("0.0000000"),
      lastModified: 19145605,
      token: {
        type: "credit_alphanum4",
        code: "REPO",
        issuer: {
          publicKey: "GCZNF24HPMYTV6NOEHI7Q5RJFFUI23JKUKY3H3XTQAFBQIBOHD5OXG3B",
        },
      },
    },
    "TERN:GDGQDVO6XPFSY4NMX75A7AOVYCF5JYGW2SHCJJNWCQWIDGOZB53DGP6C": {
      available: new BigNumber("10.0000000"),
      total: new BigNumber("10.0000000"),
      limit: new BigNumber("922337203685.4775807"),
      buyingLiabilities: new BigNumber("0.0000000"),
      sellingLiabilities: new BigNumber("0.0000000"),
      lastModified: 18902253,
      token: {
        type: "credit_alphanum4",
        code: "TERN",
        issuer: {
          publicKey: "GDGQDVO6XPFSY4NMX75A7AOVYCF5JYGW2SHCJJNWCQWIDGOZB53DGP6C",
        },
      },
    },
    "WSD:GDSVWEA7XV6M5XNLODVTPCGMAJTNBLZBXOFNQD3BNPNYALEYBNT6CE2V": {
      available: new BigNumber("0.0000000"),
      total: new BigNumber("0.0000000"),
      limit: new BigNumber("922337203685.4775807"),
      buyingLiabilities: new BigNumber("0.0000000"),
      sellingLiabilities: new BigNumber("0.0000000"),
      lastModified: 22718536,
      token: {
        type: "credit_alphanum4",
        code: "WSD",
        issuer: {
          publicKey: "GDSVWEA7XV6M5XNLODVTPCGMAJTNBLZBXOFNQD3BNPNYALEYBNT6CE2V",
        },
      },
    },
    "USD:GDUKMGUGDZQK6YHYA5Z6AY2G4XDSZPSZ3SW5UN3ARVMO6QSRDWP5YLEX": {
      available: new BigNumber("1.0000000"),
      total: new BigNumber("1.0000000"),
      limit: new BigNumber("922337203685.4775807"),
      buyingLiabilities: new BigNumber("0.0000000"),
      sellingLiabilities: new BigNumber("0.0000000"),
      lastModified: 22721290,
      token: {
        type: "credit_alphanum4",
        code: "USD",
        issuer: {
          publicKey: "GDUKMGUGDZQK6YHYA5Z6AY2G4XDSZPSZ3SW5UN3ARVMO6QSRDWP5YLEX",
        },
      },
    },
    "native": {
      available: new BigNumber("999.5689234"),
      total: new BigNumber("999.5689234"),
      buyingLiabilities: new BigNumber("0.0000000"),
      sellingLiabilities: new BigNumber("0.0000000"),
      minimumBalance: new BigNumber("3.5"),

      token: {
        type: "native",
        code: "XLM",
      },
    },
  });
});
