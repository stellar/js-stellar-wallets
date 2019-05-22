import BigNumber from "bignumber.js";

import { parseResponse } from "../testUtils";

import { OffersResponse } from "../fixtures/OffersResponse";
import { TradesResponsePartialFill } from "../fixtures/TradesResponse";

import { makeDisplayableOffers } from "./makeDisplayableOffers";

it("makes offers from partial fill", () => {
  const tradeResponse = parseResponse(TradesResponsePartialFill);
  const offers = makeDisplayableOffers(
    { publicKey: "PHYREXIA" },
    {
      // @ts-ignore
      offers: parseResponse(OffersResponse).records,
      // @ts-ignore
      tradeResponses: [tradeResponse.records],
    },
  );

  expect(offers[0]).toEqual({
    id: 76884793,
    offerer: {
      publicKey: "PHYREXIA",
    },
    paymentToken: {
      type: "native",
      code: "XLM",
    },
    incomingToken: {
      type: "credit_alphanum4",
      code: "USD",
      issuer: {
        key: "GDUKMGUGDZQK6YHYA5Z6AY2G4XDSZPSZ3SW5UN3ARVMO6QSRDWP5YLEX",
      },
    },
    incomingAmount: new BigNumber(2),
    paymentAmount: new BigNumber(8),
    incomingTokenPrice: new BigNumber(4),
    initialPaymentAmount: new BigNumber(8),
    timestamp: 23121355,
    resultingTrades: [],
  });
  expect(offers[1].resultingTrades).toEqual(["99777639383887873-0"]);
  expect(offers[1].initialPaymentAmount).toEqual(new BigNumber("520.61832"));
});
