import { Horizon } from "stellar-sdk";

import { AssetToken, Token } from "../types";

/**
 * Get the string identifier for a token.
 * @returns "native" if the token is native, otherwise returns `${tokenCode}:${issuerKey}`.
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
export function getBalanceIdentifier(balance: Horizon.BalanceLine): string {
  if (balance.asset_type === "native" || !balance.asset_issuer) {
    return "native";
  }

  return `${balance.asset_code}:${balance.asset_issuer}`;
}
