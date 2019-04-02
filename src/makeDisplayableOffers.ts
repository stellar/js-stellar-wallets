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

interface DisplayableOffersParams {
  offers: Server.CollectionPage<Server.OfferRecord>;
  trades: Server.CollectionPage<Server.TradeRecord>;
}
export function makeDisplayableOffers(params: DisplayableOffersParams): Offers {
  const { offers, trades } = params;

  // make a map of trades to their original offerids
  const offeridsToTradesMap = trades.records.reduce(
    (memo: any, trade: Server.TradeRecord) => ({
      ...memo,
      [trade.base_offer_id]: [...(memo[trade.base_offer_id] || []), trade],
      [trade.counter_offer_id]: [
        ...(memo[trade.counter_offer_id] || []),
        trade,
      ],
    }),
    {},
  );

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
        trades: offeridsToTradesMap[id] || [],
      },
    };
  }, {});
}
