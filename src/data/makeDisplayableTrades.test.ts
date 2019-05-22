import BigNumber from "bignumber.js";

import { parseResponse } from "../testUtils";

import { TradesResponsePartialFill } from "../fixtures/TradesResponse";

import { makeDisplayableTrades } from "./makeDisplayableTrades";

it("makes trades from real-world examples", () => {
  const trades = makeDisplayableTrades(
    { publicKey: "PHYREXIA" },
    // @ts-ignore
    parseResponse(TradesResponsePartialFill).records,
  );

  expect(trades).toEqual([
    {
      id: "99777639383887873-0",

      paymentToken: {
        code: "XLM",
        type: "native",
      },
      paymentAmount: new BigNumber("363.0644948"),
      paymentOfferId: "78448448",

      incomingToken: {
        code: "BAT",
        type: "credit_alphanum4",
        issuer: {
          publicKey: "GBDEVU63Y6NTHJQQZIKVTC23NWLQVP3WJ2RI2OTSJTNYOIGICST6DUXR",
        },
      },
      incomingAmount: new BigNumber("139.5761839"),
      incomingAccount: {
        publicKey: "SERRA",
      },
      incomingOfferId: "78448401",

      timestamp: 1554236520,
    },
  ]);
});
