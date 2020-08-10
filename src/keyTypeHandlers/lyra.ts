import { signTransaction } from "@stellar/lyra-api";
import { Networks, Transaction, TransactionBuilder } from "stellar-sdk";

import { HandlerSignTransactionParams, KeyTypeHandler } from "../types";

import { KeyType } from "../constants/keys";

export const lyraHandler: KeyTypeHandler = {
  keyType: KeyType.lyra,
  async signTransaction(params: HandlerSignTransactionParams) {
    const { transaction, key } = params;

    if (key.privateKey !== "") {
      throw new Error(
        `Non-ledger key sent to ledger handler: ${JSON.stringify(
          key.publicKey,
        )}`,
      );
    }

    try {
      const response = await signTransaction({
        transactionXdr: transaction.toXDR(),
      });

      if (response.error) {
        throw new Error(response.error);
      }

      // fromXDR() returns type "Transaction | FeeBumpTransaction" and
      // signTransaction() doesn't like "| FeeBumpTransaction" type, so casting
      // to "Transaction" type.
      return TransactionBuilder.fromXDR(
        response.signedTransaction,
        Networks.TESTNET,
      ) as Transaction;
    } catch (error) {
      throw new Error(
        `We couldn’t sign the transaction with Lyra. ${error.toString()}.`,
      );
    }
  },
};
