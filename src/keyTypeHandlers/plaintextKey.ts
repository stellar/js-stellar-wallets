import StellarSdk from "stellar-sdk";

import { HandlerSignTransactionParams, KeyTypeHandler } from "../types";

import { KeyType } from "../constants/keys";

export const plaintextKeyHandler: KeyTypeHandler = {
  keyType: KeyType.plaintextKey,
  signTransaction(params: HandlerSignTransactionParams) {
    const { transaction, key } = params;
    if (key.privateKey === "") {
      throw new Error(
        `Non-plaintext key sent to plaintext handler: ${JSON.stringify(
          key.publicKey,
        )}`,
      );
    }

    const keyPair = StellarSdk.Keypair.fromSecret(key.privateKey);

    transaction.sign(keyPair);

    return Promise.resolve(transaction);
  },
};
