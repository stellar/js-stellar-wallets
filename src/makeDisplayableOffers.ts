import BigNumber from "bignumber.js";
import flatten from "lodash/flatten";
import { AssetType } from "stellar-base";
import { Server } from "stellar-sdk";

import { getTokenIdentifier } from "./data";
import { makeDisplayableTrades } from "./makeDisplayableTrades";

import { Offer, Offers, Token, Trade } from "./types";

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
  [offerid: string]: Trade[];
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
  const offeridsToTradesMap: OfferIdMap = makeDisplayableTrades(trades).reduce(
    (memo: any, trade: Trade) => {
      if (trade.senderOfferId) {
        memo[trade.senderOfferId] = [
          ...(memo[trade.senderOfferId] || []),
          trade,
        ];
      }
      if (trade.receiverOfferId) {
        memo[trade.receiverOfferId] = [
          ...(memo[trade.receiverOfferId] || []),
          trade,
        ];
      }

      return memo;
    },
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

      const paymentTokenId: string = getTokenIdentifier(paymentToken);

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

      const tradePaymentAmount: BigNumber = (
        offeridsToTradesMap[id] || []
      ).reduce((memo: BigNumber, trade: Trade): BigNumber => {
        const senderTokenId = getTokenIdentifier(trade.senderToken);
        return memo.plus(
          senderTokenId === paymentTokenId
            ? trade.senderAmount
            : trade.receiverAmount,
        );
      }, new BigNumber(0));

      return {
        id,
        offerer: {
          publicKey: seller as string,
        },
        timestamp: last_modified_ledger,
        paymentToken,
        paymentAmount: new BigNumber(amount),
        initialPaymentAmount: new BigNumber(amount).plus(tradePaymentAmount),
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
