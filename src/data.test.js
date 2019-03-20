import BigNumber from "bignumber.js";
import { EffectType } from "./types";
import { reframeEffect } from "./data";

describe("reframeEffect", () => {
  const observerAccount = {
    publicKey: "OBSERVER",
  };

  const otherAccount = {
    publicKey: "OTHER",
  };

  const nativeToken = {
    type: "native",
    code: "XLM",
  };

  const otherToken = {
    type: "credit_alphanum12",
    code: "CLUE",
    issuer: {
      key: "THRABEN",
      name: "Thraben Inspector",
      url: "http://innistrad.gov",
      hostname: "innistrad",
    },
    anchorAsset: "CLUE",
    numAccounts: BigNumber(1000),
    amount: BigNumber(100000),
    bidCount: BigNumber(10),
    askCount: BigNumber(10),
    spread: BigNumber(2),
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
      senderAmount: BigNumber(2),

      receiverToken: nativeToken,
      receiverAccount: observerAccount,
      receiverAmount: BigNumber(200),
      timestamp: 1000,
    };

    expect(reframeEffect(observerAccount, effect)).toEqual({
      id: "id",
      type: EffectType.trade,
      baseToken: nativeToken,
      token: otherToken,
      amount: BigNumber(2),
      price: BigNumber(200),
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
      receiverAmount: BigNumber(2),

      senderToken: nativeToken,
      senderAccount: observerAccount,
      senderAmount: BigNumber(200),
      timestamp: 1000,
    };

    expect(reframeEffect(observerAccount, effect)).toEqual({
      id: "id",
      type: EffectType.trade,
      baseToken: nativeToken,
      token: otherToken,
      amount: BigNumber(2),
      price: BigNumber(200),
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
      amount: BigNumber(2),
      price: BigNumber(200),
      sender: otherAccount,
      timestamp: 1000,
    };

    expect(reframeEffect(observerAccount, reframedEffect)).toEqual(reframedEffect);
  });
});
