import BigNumber from "bignumber.js";
import flatten from "lodash/flatten";
import { AssetType } from "stellar-base";
import { ServerApi } from "stellar-sdk";

import { makeDisplayableTrades } from "./makeDisplayableTrades";

import { Account, Offer, Token, Trade } from "../types";

export type TradeCollection = ServerApi.TradeRecord[];

export interface DisplayableOffersParams {
  offers: ServerApi.OfferRecord[];
  tradeResponses: TradeCollection[];
}

interface OfferIdMap {
  [offerid: string]: Trade[];
}

export function makeDisplayableOffers(
  subjectAccount: Account,
  params: DisplayableOffersParams,
): Offer[] {
  const { offers, tradeResponses } = params;
  const trades = flatten(tradeResponses);

  // make a map of offerids to the trades involved with them
  // (reminder that each trade has two offerids, one for each side)
  const offeridsToTradesMap: OfferIdMap = makeDisplayableTrades(
    subjectAccount,
    trades,
  ).reduce((memo: any, trade: Trade) => {
    if (trade.paymentOfferId) {
      memo[trade.paymentOfferId] = [
        ...(memo[trade.paymentOfferId] || []),
        trade,
      ];
    }

    return memo;
  }, {});

  return offers.map(
    (offer: ServerApi.OfferRecord): Offer => {
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
                key: selling.asset_issuer,
              },
      };

      const incomingToken: Token = {
        type: buying.asset_type as AssetType,
        code: buying.asset_code || "XLM",
        issuer:
          buying.asset_type === "native"
            ? undefined
            : {
                key: buying.asset_issuer,
              },
      };

      const tradePaymentAmount: BigNumber = (
        offeridsToTradesMap[id] || []
      ).reduce((memo: BigNumber, trade: Trade): BigNumber => {
        return memo.plus(trade.paymentAmount);
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
