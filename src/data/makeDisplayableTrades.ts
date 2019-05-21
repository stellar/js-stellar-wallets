import BigNumber from "bignumber.js";
import { AssetType } from "stellar-base";
import { Server } from "stellar-sdk";

import { Account, Token, Trade, Trades } from "../types";

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
  trades: Server.TradeRecord[],
): Trades {
  // make a map of trades to their original offerids
  return trades.map(
    (trade: Server.TradeRecord): Trade => {
      const base = {
        publicKey: trade.base_account,
      };

      const counter = {
        publicKey: trade.counter_account,
      };

      const isSubjectBase: boolean =
        base.publicKey === subjectAccount.publicKey;

      const baseToken: Token = {
        type: trade.base_asset_type as AssetType,
        code: trade.base_asset_code || "XLM",
        issuer:
          trade.base_asset_type === "native"
            ? undefined
            : {
                publicKey: trade.base_asset_issuer,
              },
      };

      const counterToken: Token = {
        type: trade.counter_asset_type as AssetType,
        code: trade.counter_asset_code || "XLM",
        issuer:
          trade.counter_asset_type === "native"
            ? undefined
            : {
                publicKey: trade.counter_asset_issuer,
              },
      };

      return {
        id: trade.id,
        timestamp: Math.floor(
          new Date(trade.ledger_close_time).getTime() / 1000,
        ),

        paymentToken: isSubjectBase ? baseToken : counterToken,
        paymentAmount: isSubjectBase
          ? new BigNumber(trade.base_amount)
          : new BigNumber(trade.counter_amount),
        paymentOfferId: isSubjectBase
          ? trade.base_offer_id
          : trade.counter_offer_id,

        incomingToken: isSubjectBase ? counterToken : baseToken,
        incomingAmount: isSubjectBase
          ? new BigNumber(trade.counter_amount)
          : new BigNumber(trade.base_amount),
        incomingAccount: isSubjectBase ? counter : base,
        incomingOfferId: isSubjectBase
          ? trade.counter_offer_id
          : trade.base_offer_id,
      };
    },
  );
}
