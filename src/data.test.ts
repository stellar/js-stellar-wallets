import BigNumber from "bignumber.js";
import { reframeEffect } from "./data";
import { EffectType, TokenType } from "./types";

describe("reframeEffect", () => {
  const observerAccount = {
    publicKey: "OBSERVER",
  };

  const otherAccount = {
    publicKey: "OTHER",
  };

  const nativeToken = {
    type: TokenType.native,
    code: "XLM",
  };

  const otherToken = {
    type: TokenType.credit_alphanum12,
    code: "CLUE",
    issuer: {
      key: "THRABEN",
      name: "Thraben",
      url: "http://thraben.gov",
      hostName: "thraben",
    },
    anchorAsset: "CLUE",
    numAccounts: new BigNumber(1000),
    amount: new BigNumber(100000),
    bidCount: new BigNumber(10),
    askCount: new BigNumber(10),
    spread: new BigNumber(2),
  };

  test("reframes effects: you're the receiver", () => {
    /* 
      In plain language: I sent someone 200 XLM for 2 CLUE tokens.
      They were 
    */
    const effect = {
      id: "id",
      type: EffectType.trade,
      senderToken: otherToken,
      senderAccount: otherAccount,
      senderAmount: new BigNumber(2),

      receiverToken: nativeToken,
      receiverAccount: observerAccount,
      receiverAmount: new BigNumber(200),
      timestamp: 1000,
    };

    expect(reframeEffect(observerAccount, effect)).toEqual({
      id: "id",
      type: EffectType.trade,
      baseToken: nativeToken,
      token: otherToken,
      amount: new BigNumber(2),
      price: new BigNumber(200),
      sender: otherAccount,
      timestamp: 1000,
    });
  });

  test("reframes effects: you're the sender", () => {
    /* 
      In plain language: I sent someone 200 XLM for 2 CLUE tokens.
    */
    const effect = {
      id: "id",
      type: EffectType.trade,
      receiverToken: otherToken,
      receiverAccount: otherAccount,
      receiverAmount: new BigNumber(2),

      senderToken: nativeToken,
      senderAccount: observerAccount,
      senderAmount: new BigNumber(200),
      timestamp: 1000,
    };

    expect(reframeEffect(observerAccount, effect)).toEqual({
      id: "id",
      type: EffectType.trade,
      baseToken: nativeToken,
      token: otherToken,
      amount: new BigNumber(2),
      price: new BigNumber(200),
      sender: otherAccount,
      timestamp: 1000,
    });
  });
  test("sends back already-reframed effects", () => {
    const reframedEffect = {
      id: "id",
      type: EffectType.trade,
      baseToken: nativeToken,
      token: otherToken,
      amount: new BigNumber(2),
      price: new BigNumber(200),
      sender: otherAccount,
      timestamp: 1000,
    };

    expect(reframeEffect(observerAccount, reframedEffect)).toEqual(reframedEffect);
  });
});
