import { AssetType, Horizon } from "@stellar/stellar-sdk";
import BigNumber from "bignumber.js";

import { Account, Token, Trade } from "../types";

/*
  {
    _links: {
      self: {
        href: "",
      },
      base: {
        href: "https://horizon.stellar.org/accounts/PHYREXIA",
      },
      counter: {
        href: "https://horizon.stellar.org/accounts/SERRA",
      },
      operation: {
        href: "https://horizon.stellar.org/operations/99777639383887873",
      },
    },
    id: "99777639383887873-0",
    paging_token: "99777639383887873-0",
    ledger_close_time: "2019-04-02T20:22:00Z",
    offer_id: "78448401",
    base_offer_id: "78448448",
    base_account: "PHYREXIA",
    base_amount: "363.0644948",
    base_asset_type: "native",
    counter_offer_id: "78448401",
    counter_account: "SERRA",
    counter_amount: "139.5761839",
    counter_asset_type: "credit_alphanum4",
    counter_asset_code: "BAT",
    counter_asset_issuer:
      "GBDEVU63Y6NTHJQQZIKVTC23NWLQVP3WJ2RI2OTSJTNYOIGICST6DUXR",
    base_is_seller: false,
    price: {
      n: 10000000,
      d: 26011923,
    },
  },

*/

export function makeDisplayableTrades(
  subjectAccount: Account,
  trades: Horizon.ServerApi.TradeRecord[],
): Trade[] {
  // make a map of trades to their original offerids
  return trades.map(
    (trade: Horizon.ServerApi.TradeRecord): Trade => {
      const base = {
        publicKey: trade.base_account || "",
      };

      const counter = {
        publicKey: trade.counter_account || "",
      };

      const isSubjectBase: boolean =
        base.publicKey === subjectAccount.publicKey;

      const baseToken: Token = {
        type: trade.base_asset_type as AssetType,
        code: (trade.base_asset_code as string) || "XLM",
        issuer:
          trade.base_asset_type === "native"
            ? undefined
            : {
                key: trade.base_asset_issuer as string,
              },
      };

      const counterToken: Token = {
        type: trade.counter_asset_type as AssetType,
        code: (trade.counter_asset_code as string) || "XLM",
        issuer:
          trade.counter_asset_type === "native"
            ? undefined
            : {
                key: trade.counter_asset_issuer as string,
              },
      };

      let paymentOfferId;
      let incomingOfferId;

      if ("base_offer_id" in trade) {
        paymentOfferId = isSubjectBase
          ? trade.base_offer_id
          : trade.counter_offer_id;

        incomingOfferId = isSubjectBase
          ? trade.counter_offer_id
          : trade.base_offer_id;
      }

      return {
        id: trade.id,
        timestamp: Math.floor(
          new Date(trade.ledger_close_time).getTime() / 1000,
        ),

        paymentToken: isSubjectBase ? baseToken : counterToken,
        paymentAmount: isSubjectBase
          ? new BigNumber(trade.base_amount)
          : new BigNumber(trade.counter_amount),
        paymentOfferId,

        incomingToken: isSubjectBase ? counterToken : baseToken,
        incomingAmount: isSubjectBase
          ? new BigNumber(trade.counter_amount)
          : new BigNumber(trade.base_amount),
        incomingAccount: isSubjectBase ? counter : base,
        incomingOfferId,
      };
    },
  );
}
