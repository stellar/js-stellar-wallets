import { Transaction } from "stellar-base";
import StellarSdk from "stellar-sdk";

import { Key, KeyType, KeyTypeHandler } from "../types";

export const plaintextKeyHandler: KeyTypeHandler = {
  keyType: KeyType.ledger,
  async signTransaction({
    transaction,
    key,
  }: {
    transaction: Transaction;
    key: Key;
  }) {
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
