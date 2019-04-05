import BigNumber from "bignumber.js";
import flatten from "lodash/flatten";
import { AssetType } from "stellar-base";
import { Server } from "stellar-sdk";

import { Offer, Offers, Token } from "./types";

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

type TradeCollection = Server.TradeRecord[];

interface OfferIdMap {
  [offerid: string]: Server.TradeRecord[];
}

interface DisplayableOffersParams {
  offers: Server.OfferRecord[];
  tradeResponses: TradeCollection[];
}
export function makeDisplayableOffers(params: DisplayableOffersParams): Offers {
  const { offers, tradeResponses } = params;
  const trades = flatten(tradeResponses);

  // make a map of offerids to the trades involved with them
  // (reminder that each trade has two offerids, one for each side)
  const offeridsToTradesMap: OfferIdMap = trades.reduce(
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

  return offers.map(
    (offer: Server.OfferRecord): Offer => {
      const {
        id,
        selling,
        seller,
        buying,
        amount,
        price_r,
        last_modified_ledger,
      } = offer;

      console.log("seellar fucko: ", seller);

      const paymentToken: Token = {
        type: selling.asset_type as AssetType,
        code: selling.asset_code || "XLM",
        issuer:
          selling.asset_type === "native"
            ? undefined
            : {
                publicKey: selling.asset_issuer,
              },
      };

      const incomingToken: Token = {
        type: buying.asset_type as AssetType,
        code: buying.asset_code || "XLM",
        issuer:
          buying.asset_type === "native"
            ? undefined
            : {
                publicKey: buying.asset_issuer,
              },
      };

      return {
        id,
        offerer: {
          publicKey: seller as string,
        },
        timestamp: last_modified_ledger,
        paymentToken,
        paymentAmount: new BigNumber(amount),
        incomingToken,
        incomingAmount: new BigNumber(price_r.n).div(price_r.d).times(amount),
        incomingTokenPrice: new BigNumber(1).div(price_r.n).times(price_r.d),
        resultingTrades: (offeridsToTradesMap[id] || []).map(
          (trade) => trade.id,
        ),
      };
    },
  );
}
