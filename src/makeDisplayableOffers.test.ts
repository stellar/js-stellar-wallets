import BigNumber from "bignumber.js";

import { parseResponse } from "./testUtils";

import { OffersResponse } from "./fixtures/OffersResponse";

import { makeDisplayableOffers } from "./makeDisplayableOffers";

it("makes offers from real-world examples", () => {
  // @ts-ignore
  const offers = makeDisplayableOffers(parseResponse(OffersResponse));

  expect(offers).toEqual({
    76884793: {
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
          publicKey: "GDUKMGUGDZQK6YHYA5Z6AY2G4XDSZPSZ3SW5UN3ARVMO6QSRDWP5YLEX",
        },
      },
      incomingAmount: new BigNumber(2),
      paymentAmount: new BigNumber(8),
      incomingTokenPrice: new BigNumber(4),
      timestamp: 23121355,
      trades: [],
    },
  });
});
