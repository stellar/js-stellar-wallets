import { Asset, Horizon } from "stellar-sdk";

import { AssetToken, Token } from "../types";

/**
 * Get the string identifier for a token.
 * @returns "native" if the token is native, otherwise returns
 * `${tokenCode}:${issuerKey}`.
 */
export function getTokenIdentifier(token: Token): string {
  if (token.type === "native") {
    return "native";
  }

  return `${token.code}:${(token as AssetToken).issuer.key}`;
}

/**
 * Get the string identifier for a balance line item from Horizon. The response
 * should be the same as if that balance was a Token object, and you passed it
 * through `getTokenIdentifier`
 * @returns Returns `${tokenCode}:${issuerKey}`.
 */
export function getBalanceIdentifier(
  balance: Horizon.HorizonApi.BalanceLine,
): string {
  if ("asset_issuer" in balance && !balance.asset_issuer) {
    return "native";
  }
  switch (balance.asset_type) {
    case "credit_alphanum4":
    case "credit_alphanum12":
      return `${balance.asset_code}:${balance.asset_issuer}`;

    case "liquidity_pool_shares":
      return `${balance.liquidity_pool_id}:lp`;

    default:
      return "native";
  }
}

/**
 * Convert a Wallet-SDK-formatted Token object to a Stellar SDK Asset object.
 * @returns Returns `${tokenCode}:${issuerKey}`.
 */
export function getStellarSdkAsset(token: Token): Asset {
  if (token.type === "native") {
    return Asset.native();
  }

  return new Asset(token.code, (token as AssetToken).issuer.key);
}
