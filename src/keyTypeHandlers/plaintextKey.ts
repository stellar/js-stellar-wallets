import { Keypair } from "@stellar/stellar-sdk";

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

    const keyPair = Keypair.fromSecret(key.privateKey);

    /*
     * NOTE: we need to use the combo of getKeypairSignature() + addSignature()
     * here in place of the shorter sign() call because sign() results in a
     * "XDR Write Error: [object Object] is not a DecoratedSignature" error
     * on React Native whenever we try to call transaction.toXDR() on the signed
     * transaction.
     */

    const signature = transaction.getKeypairSignature(keyPair);
    transaction.addSignature(keyPair.publicKey(), signature);

    return Promise.resolve(transaction);
  },
};
