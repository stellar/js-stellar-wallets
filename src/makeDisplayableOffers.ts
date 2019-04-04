import BigNumber from "bignumber.js";
import flatten from "lodash/flatten";
import { Server } from "stellar-sdk";

import { OfferMap, Token } from "./types";

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

/**
 * Given an array of trades per offer, flatten them to a list of trades
 */
export function getAllTrades(
  tradeResponses: TradeCollection[],
): Server.TradeRecord[] {
  return flatten(
    tradeResponses.map(
      (trades: TradeCollection): Server.TradeRecord[] => trades.records,
    ),
  );
}

type TradeCollection = Server.CollectionPage<Server.TradeRecord>;

interface OfferIdMap {
  [offerid: string]: Server.TradeRecord[];
}

interface DisplayableOffersParams {
  offers: Server.CollectionPage<Server.OfferRecord>;
  tradeResponses: TradeCollection[];
}
export function makeDisplayableOffers(
  params: DisplayableOffersParams,
): OfferMap {
  const { offers, tradeResponses } = params;

  // make a map of offerids to the trades involved with them
  // (reminder that each trade has two offerids, one for each side)
  const offeridsToTradesMap: OfferIdMap = getAllTrades(tradeResponses).reduce(
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
        resultingTrades: (offeridsToTradesMap[id] || []).map(
          (trade) => trade.id,
        ),
      },
    };
  }, {});
}
