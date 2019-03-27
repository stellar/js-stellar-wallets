import BigNumber from "bignumber.js";
import { Server } from "stellar-sdk";

import { Offers, Token } from "./types";

/*
export interface Effect {
  id: string;
  senderToken: Token;
  receiverToken: Token;
  senderAccount: Account;
  senderAmount: BigNumber;
  receiverAmount: BigNumber;
  timestamp: number;
}
*/

export function makeDisplayableOffers(
  offers: Server.CollectionPage<Server.OfferRecord>,
): Offers {
  return offers.records.reduce((memo, offer: Server.OfferRecord) => {
    const {
      id,
      selling,
      seller,
      buying,
      amount,
      price_r,
      last_modified_ledger,
    } = offer;

    const paymentToken: Token = {
      type: selling.asset_type,
      code: selling.asset_code || "XLM",
      issuer:
        selling.asset_type === "native"
          ? undefined
          : {
              publicKey: selling.asset_issuer,
            },
    };

    const incomingToken: Token = {
      type: buying.asset_type,
      code: buying.asset_code || "XLM",
      issuer:
        buying.asset_type === "native"
          ? undefined
          : {
              publicKey: buying.asset_issuer,
            },
    };

    return {
      ...memo,
      [id]: {
        id,
        offerer: {
          publicKey: seller,
        },
        timestamp: last_modified_ledger,
        paymentToken,
        paymentAmount: new BigNumber(amount),
        incomingToken,
        incomingAmount: new BigNumber(price_r.n).div(price_r.d).times(amount),
        incomingTokenPrice: new BigNumber(1).div(price_r.n).times(price_r.d),
        trades: [],
      },
    };
  }, {});
}
