import BigNumber from "bignumber.js";
import { Horizon, ServerApi } from "stellar-sdk";

import { BASE_RESERVE, BASE_RESERVE_MIN_COUNT } from "../constants/stellar";
import { BalanceMap } from "../types";
import { getBalanceIdentifier } from "./";

export function makeDisplayableBalances(
  accountDetails: ServerApi.AccountRecord,
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
      const sellingLiabilities = new BigNumber(balance.selling_liabilities);
      const buyingLiabilities = new BigNumber(balance.buying_liabilities);
      const available = total.minus(sellingLiabilities);

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

      const assetBalance = balance as Horizon.BalanceLineAsset;
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
