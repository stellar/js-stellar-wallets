import { Account, Effect, ReframedEffect, Token } from "./types";

/**
 * Get the string identifier for a token.
 */
export function getTokenIdentifier(token: Token): string {
  if (token.type === "native" || !token.issuer) {
    return "native";
  }

  return `${token.code}:${token.issuer.key}`;
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
  } = effect;

  const isObserverSender = senderAccount.publicKey === observerAccount.publicKey;

  if (isObserverSender) {
    return {
      amount: receiverAmount,
      baseToken: senderToken,
      id,
      price: senderAmount,
      sender: receiverAccount,
      timestamp,
      token: receiverToken,
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
  };
}
