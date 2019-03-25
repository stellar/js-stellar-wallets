import BigNumber from "bignumber.js";
import { Horizon, Server } from "stellar-sdk";

import { Balances, TokenType } from "./types";

import { BASE_RESERVE, BASE_RESERVE_MIN_COUNT } from "./constants/stellar";

import { getBalanceIdentifier } from "./data";

export function makeDisplayableBalances(
  accountDetails: Server.AccountRecord,
): Balances {
  const { balances, subentry_count } = accountDetails;

  const displayableBalances = Object.values(balances).reduce(
    (memo, balance) => {
      const identifier = getBalanceIdentifier(balance);

      const total = new BigNumber(balance.balance);
      const sellingLiabilities = new BigNumber(balance.selling_liabilities);
      const buyingLiabilities = new BigNumber(balance.buying_liabilities);
      const available = total.minus(sellingLiabilities);

      if (identifier === "native") {
        // define the native balance line later
        return {
          ...memo,
          native: {
            token: {
              type: TokenType.native,
              code: "XLM",
            },
            total,
            available,
            sellingLiabilities,
            buyingLiabilities,
            minimumBalance: new BigNumber(
              subentry_count + BASE_RESERVE_MIN_COUNT,
            ).times(BASE_RESERVE),
          },
        };
      }

      return {
        ...memo,
        [identifier]: {
          token: {
            type: (balance as Horizon.BalanceLineAsset).asset_type,
            code: (balance as Horizon.BalanceLineAsset).asset_code,
            issuer: {
              publicKey: (balance as Horizon.BalanceLineAsset).asset_issuer,
            },
          },
          sellingLiabilities,
          buyingLiabilities,
          total,
          lastModified: (balance as Horizon.BalanceLineAsset)
            .last_modified_ledger,
          limit: new BigNumber((balance as Horizon.BalanceLineAsset).limit),
          available: total.minus(sellingLiabilities),
        },
      };
    },
    {},
  );

  return displayableBalances as Balances;
}
