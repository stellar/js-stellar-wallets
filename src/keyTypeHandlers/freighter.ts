import freighterApi from "@stellar/freighter-api";
import { Networks, Transaction, TransactionBuilder } from "stellar-sdk";

import { HandlerSignTransactionParams, KeyTypeHandler } from "../types";

import { KeyType } from "../constants/keys";

export const freighterHandler: KeyTypeHandler = {
  keyType: KeyType.freighter,
  async signTransaction(params: HandlerSignTransactionParams) {
    const { transaction, key, custom } = params;

    if (key.privateKey !== "") {
      throw new Error(
        `Non-ledger key sent to ledger handler: ${JSON.stringify(
          key.publicKey,
        )}`,
      );
    }

    try {
      const response = await freighterApi.signTransaction(
        transaction.toXDR(),
        custom && custom.network ? custom.network : undefined,
      );

      // fromXDR() returns type "Transaction | FeeBumpTransaction" and
      // signTransaction() doesn't like "| FeeBumpTransaction" type, so casting
      // to "Transaction" type.
      return TransactionBuilder.fromXDR(
        response,
        Networks.PUBLIC,
      ) as Transaction;
    } catch (error) {
      const errorMsg = (error as any).toString();
      throw new Error(
        `We couldn’t sign the transaction with Freighter. ${errorMsg}.`,
      );
    }
  },
};
