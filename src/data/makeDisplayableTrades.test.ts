import BigNumber from "bignumber.js";

import { parseResponse } from "../testUtils";

import { TradesResponsePartialFill } from "../fixtures/TradesResponse";

import { makeDisplayableTrades } from "./makeDisplayableTrades";

it("makes trades from real-world examples", () => {
  const trades = makeDisplayableTrades(
    // @ts-ignore
    parseResponse(TradesResponsePartialFill).records,
  );

  expect(trades).toEqual([
    {
      id: "99777639383887873-0",

      senderToken: {
        code: "BAT",
        type: "credit_alphanum4",
        issuer: {
          publicKey: "GBDEVU63Y6NTHJQQZIKVTC23NWLQVP3WJ2RI2OTSJTNYOIGICST6DUXR",
        },
      },

      senderAccount: {
        publicKey: "SERRA",
      },
      senderAmount: new BigNumber("139.5761839"),
      senderOfferId: "78448401",

      receiverToken: {
        code: "XLM",
        type: "native",
      },
      receiverAccount: {
        publicKey: "PHYREXIA",
      },
      receiverAmount: new BigNumber("363.0644948"),
      receiverOfferId: "78448448",

      timestamp: 1554236520,
    },
  ]);
});
