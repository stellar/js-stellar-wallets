import { Keypair } from "@stellar/stellar-sdk";

import { HandlerSignTransactionParams, KeyTypeHandler } from "../types";

import { KeyType } from "../constants/keys";

export const plaintextKeyHandler: KeyTypeHandler = {
  keyType: KeyType.ledger,
  signTransaction(params: HandlerSignTransactionParams) {
    const { transaction, key } = params;
    if (key.privateKey === "") {
      throw new Error(
        `Non-plaintext key sent to plaintext handler: ${JSON.stringify(
          key.publicKey,
        )}`,
      );
    }

    const keyPair = Keypair.fromSecret(key.privateKey);

    transaction.sign(keyPair);

    return Promise.resolve(transaction);
  },
};
