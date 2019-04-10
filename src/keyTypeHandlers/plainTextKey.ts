import { Transaction } from "stellar-base";
import StellarSdk from "stellar-sdk";

import { Key, KeyType, KeyTypeHandler, PlainTextKey } from "../types";

export const ledgerHandler: KeyTypeHandler = {
  keyType: KeyType.ledger,
  async signTransaction({
    transaction,
    key,
  }: {
    transaction: Transaction;
    key: Key;
  }) {
    if ((key as PlainTextKey).privateKey === undefined) {
      throw new Error(
        `Non-plaintext key sent to plaintext handler: ${JSON.stringify(
          key.publicKey,
        )}`,
      );
    }

    const keyPair = StellarSdk.Keypair.fromSecret(
      (key as PlainTextKey).privateKey,
    );
    transaction.sign(keyPair);

    return Promise.resolve(transaction);
  },
};
