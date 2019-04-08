import { Horizon } from "stellar-sdk";

import { Account, AssetToken, Effect, ReframedEffect, Token } from "./types";

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

function isReframedEffect(obj: any): obj is ReframedEffect {
  return obj.baseToken !== undefined;
}

/**
 * Reframe a normal effect from a specific observer account's
 * perspective.
 */
export function reframeEffect(
  observerAccount: Account,
  effect: Effect | ReframedEffect,
): ReframedEffect {
  // if the effect has already been reframed, we're done!
  if (isReframedEffect(effect)) {
    return effect;
  }

  const {
    id,
    senderToken,
    receiverToken,
    senderAccount,
    receiverAccount,
    senderAmount,
    receiverAmount,
    timestamp,
    type,
  } = effect;

  const isObserverSender =
    senderAccount.publicKey === observerAccount.publicKey;

  if (isObserverSender) {
    return {
      id,
      baseToken: senderToken,
      token: receiverToken,
      amount: receiverAmount,
      price: senderAmount,
      sender: receiverAccount,
      timestamp,
      type,
    };
  }

  return {
    id,
    baseToken: receiverToken,
    token: senderToken,
    amount: senderAmount,
    price: receiverAmount,
    sender: senderAccount,
    timestamp,
    type,
  };
}
