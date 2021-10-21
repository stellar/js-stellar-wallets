import BigNumber from "bignumber.js";

import { AccountResponse } from "../fixtures/AccountResponse";
import { SponsoredAccountResponse } from "../fixtures/SponsoredAccountResponse";
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
      token: {
        type: "credit_alphanum4",
        code: "BAT",
        issuer: {
          key: "GBDEVU63Y6NTHJQQZIKVTC23NWLQVP3WJ2RI2OTSJTNYOIGICST6DUXR",
        },
      },
    },
    "REPO:GCZNF24HPMYTV6NOEHI7Q5RJFFUI23JKUKY3H3XTQAFBQIBOHD5OXG3B": {
      available: new BigNumber("19.0000000"),
      total: new BigNumber("19.0000000"),
      limit: new BigNumber("922337203685.4775807"),
      buyingLiabilities: new BigNumber("0.0000000"),
      sellingLiabilities: new BigNumber("0.0000000"),
      token: {
        type: "credit_alphanum4",
        code: "REPO",
        issuer: {
          key: "GCZNF24HPMYTV6NOEHI7Q5RJFFUI23JKUKY3H3XTQAFBQIBOHD5OXG3B",
        },
      },
    },
    "TERN:GDGQDVO6XPFSY4NMX75A7AOVYCF5JYGW2SHCJJNWCQWIDGOZB53DGP6C": {
      available: new BigNumber("10.0000000"),
      total: new BigNumber("10.0000000"),
      limit: new BigNumber("922337203685.4775807"),
      buyingLiabilities: new BigNumber("0.0000000"),
      sellingLiabilities: new BigNumber("0.0000000"),
      token: {
        type: "credit_alphanum4",
        code: "TERN",
        issuer: {
          key: "GDGQDVO6XPFSY4NMX75A7AOVYCF5JYGW2SHCJJNWCQWIDGOZB53DGP6C",
        },
      },
    },
    "WSD:GDSVWEA7XV6M5XNLODVTPCGMAJTNBLZBXOFNQD3BNPNYALEYBNT6CE2V": {
      available: new BigNumber("0.0000000"),
      total: new BigNumber("0.0000000"),
      limit: new BigNumber("922337203685.4775807"),
      buyingLiabilities: new BigNumber("0.0000000"),
      sellingLiabilities: new BigNumber("0.0000000"),
      token: {
        type: "credit_alphanum4",
        code: "WSD",
        issuer: {
          key: "GDSVWEA7XV6M5XNLODVTPCGMAJTNBLZBXOFNQD3BNPNYALEYBNT6CE2V",
        },
      },
    },
    "USD:GDUKMGUGDZQK6YHYA5Z6AY2G4XDSZPSZ3SW5UN3ARVMO6QSRDWP5YLEX": {
      available: new BigNumber("1.0000000"),
      total: new BigNumber("1.0000000"),
      limit: new BigNumber("922337203685.4775807"),
      buyingLiabilities: new BigNumber("0.0000000"),
      sellingLiabilities: new BigNumber("0.0000000"),
      token: {
        type: "credit_alphanum4",
        code: "USD",
        issuer: {
          key: "GDUKMGUGDZQK6YHYA5Z6AY2G4XDSZPSZ3SW5UN3ARVMO6QSRDWP5YLEX",
        },
      },
    },
    // tslint:disable-next-line
    "liquidity_pool_shares:0466a6bbafdc293b87f2ea7615919244057242b21ebf46b38d64536e8d2ac3c0": {
      liquidity_pool_id:
        "0466a6bbafdc293b87f2ea7615919244057242b21ebf46b38d64536e8d2ac3c0",
      total: new BigNumber("1.0000000"),
      limit: new BigNumber("922337203685.4775807"),
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

it("makes balances for sponsored account", async () => {
  const balances = makeDisplayableBalances(
    // @ts-ignore
    parseResponse(SponsoredAccountResponse),
  );

  expect(balances).toEqual({
    "ARST:GB7TAYRUZGE6TVT7NHP5SMIZRNQA6PLM423EYISAOAP3MKYIQMVYP2JO": {
      available: new BigNumber("10"),
      total: new BigNumber("10"),
      limit: new BigNumber("922337203685.4775807"),
      buyingLiabilities: new BigNumber("0.0000000"),
      sellingLiabilities: new BigNumber("0.0000000"),
      sponsor: "GBG7VGZFH4TU2GS7WL5LMPYFNP64ZFR23XEGAV7GPEEXKWOR2DKCYPCK",
      token: {
        type: "credit_alphanum4",
        code: "ARST",
        issuer: {
          key: "GB7TAYRUZGE6TVT7NHP5SMIZRNQA6PLM423EYISAOAP3MKYIQMVYP2JO",
        },
      },
    },

    "SRT:GCDNJUBQSX7AJWLJACMJ7I4BC3Z47BQUTMHEICZLE6MU4KQBRYG5JY6B": {
      available: new BigNumber("0"),
      total: new BigNumber("0"),
      limit: new BigNumber("922337203685.4775807"),
      buyingLiabilities: new BigNumber("0.0000000"),
      sellingLiabilities: new BigNumber("0.0000000"),
      sponsor: "GBG7VGZFH4TU2GS7WL5LMPYFNP64ZFR23XEGAV7GPEEXKWOR2DKCYPCK",
      token: {
        type: "credit_alphanum4",
        code: "SRT",
        issuer: {
          key: "GCDNJUBQSX7AJWLJACMJ7I4BC3Z47BQUTMHEICZLE6MU4KQBRYG5JY6B",
        },
      },
    },

    "USD:GCKFBEIYV2U22IO2BJ4KVJOIP7XPWQGQFKKWXR6DOSJBV7STMAQSMTGG": {
      available: new BigNumber("0"),
      total: new BigNumber("0"),
      limit: new BigNumber("922337203685.4775807"),
      buyingLiabilities: new BigNumber("0.0000000"),
      sellingLiabilities: new BigNumber("0.0000000"),
      sponsor: "GBG7VGZFH4TU2GS7WL5LMPYFNP64ZFR23XEGAV7GPEEXKWOR2DKCYPCK",
      token: {
        type: "credit_alphanum4",
        code: "USD",
        issuer: {
          key: "GCKFBEIYV2U22IO2BJ4KVJOIP7XPWQGQFKKWXR6DOSJBV7STMAQSMTGG",
        },
      },
    },

    "USDC:GC5W3BH2MQRQK2H4A6LP3SXDSAAY2W2W64OWKKVNQIAOVWSAHFDEUSDC": {
      available: new BigNumber("5"),
      total: new BigNumber("5"),
      limit: new BigNumber("922337203685.4775807"),
      buyingLiabilities: new BigNumber("0.0000000"),
      sellingLiabilities: new BigNumber("0.0000000"),
      sponsor: "GBG7VGZFH4TU2GS7WL5LMPYFNP64ZFR23XEGAV7GPEEXKWOR2DKCYPCK",
      token: {
        type: "credit_alphanum4",
        code: "USDC",
        issuer: {
          key: "GC5W3BH2MQRQK2H4A6LP3SXDSAAY2W2W64OWKKVNQIAOVWSAHFDEUSDC",
        },
      },
    },

    "native": {
      available: new BigNumber("0"),
      total: new BigNumber("0"),
      buyingLiabilities: new BigNumber("0.0000000"),
      sellingLiabilities: new BigNumber("0.0000000"),
      minimumBalance: new BigNumber("0"),

      token: {
        type: "native",
        code: "XLM",
      },
    },
  });
});
