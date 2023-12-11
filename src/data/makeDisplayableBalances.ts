import { Horizon } from "@stellar/stellar-sdk";
import BigNumber from "bignumber.js";

import { BASE_RESERVE, BASE_RESERVE_MIN_COUNT } from "../constants/stellar";
import { BalanceMap } from "../types";
import { getBalanceIdentifier } from "./";

export function makeDisplayableBalances(
  accountDetails: Horizon.ServerApi.AccountRecord,
): BalanceMap {
  const {
    balances,
    subentry_count,
    num_sponsored,
    num_sponsoring,
  } = accountDetails;

  const displayableBalances = Object.values(balances).reduce(
    (memo, balance) => {
      const identifier = getBalanceIdentifier(balance);
      const total = new BigNumber(balance.balance);

      let sellingLiabilities = new BigNumber(0);
      let buyingLiabilities = new BigNumber(0);
      let available;

      if ("selling_liabilities" in balance) {
        sellingLiabilities = new BigNumber(balance.selling_liabilities);
        available = total.minus(sellingLiabilities);
      }

      if ("buying_liabilities" in balance) {
        buyingLiabilities = new BigNumber(balance.buying_liabilities);
      }

      if (identifier === "native") {
        // define the native balance line later
        return {
          ...memo,
          native: {
            token: {
              type: "native",
              code: "XLM",
            },
            total,
            available,
            sellingLiabilities,
            buyingLiabilities,

            /* tslint:disable */
            // https://developers.stellar.org/docs/glossary/sponsored-reserves/#sponsorship-effect-on-minimum-balance
            /* tslint:enable */
            minimumBalance: new BigNumber(BASE_RESERVE_MIN_COUNT)
              .plus(subentry_count)
              .plus(num_sponsoring)
              .minus(num_sponsored)
              .times(BASE_RESERVE)
              .plus(sellingLiabilities),
          },
        };
      }

      /* tslint:disable */
      const liquidityPoolBalance = balance as Horizon.HorizonApi.BalanceLineLiquidityPool;
      /* tslint:enable */

      if (identifier.includes(":lp")) {
        return {
          ...memo,
          [identifier]: {
            liquidity_pool_id: liquidityPoolBalance.liquidity_pool_id,
            total,
            limit: new BigNumber(liquidityPoolBalance.limit),
          },
        };
      }

      const assetBalance = balance as Horizon.HorizonApi.BalanceLineAsset;
      const assetSponsor = assetBalance.sponsor
        ? { sponsor: assetBalance.sponsor }
        : {};

      return {
        ...memo,
        [identifier]: {
          token: {
            type: assetBalance.asset_type,
            code: assetBalance.asset_code,
            issuer: {
              key: assetBalance.asset_issuer,
            },
          },
          sellingLiabilities,
          buyingLiabilities,
          total,
          limit: new BigNumber(assetBalance.limit),
          available: total.minus(sellingLiabilities),
          ...assetSponsor,
        },
      };
    },
    {},
  );

  return displayableBalances as BalanceMap;
}
