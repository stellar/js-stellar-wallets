import { Transaction } from "stellar-base";

import { isLedgerKey } from "../KeyHelpers";
import { Key, KeyType, KeyTypeHandler } from "../types";

export const ledgerHandler: KeyTypeHandler = {
  keyType: KeyType.ledger,
  signTransaction({
    transaction,
    key,
  }: {
    transaction: Transaction;
    key: Key;
  }) {
    if (!isLedgerKey(key)) {
      throw new Error(
        `Non-ledger key sent to ledger handler: ${JSON.stringify(
          key.publicKey,
        )}`,
      );
    }

    console.log("key: ", key);
    return Promise.resolve(transaction);
  },
};
