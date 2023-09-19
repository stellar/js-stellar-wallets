import albedo from "@albedo-link/intent";
import { Networks, Transaction, TransactionBuilder } from "stellar-sdk";

import { HandlerSignTransactionParams, KeyTypeHandler } from "../types";

import { KeyType } from "../constants/keys";

export const albedoHandler: KeyTypeHandler = {
  keyType: KeyType.albedo,
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
      const xdr = transaction.toXDR();
      const response = await albedo.tx({ xdr });

      if (!response.signed_envelope_xdr) {
        throw new Error("We couldn’t sign the transaction with Albedo.");
      }

      // fromXDR() returns type "Transaction | FeeBumpTransaction" and
      // signTransaction() doesn't like "| FeeBumpTransaction" type, so casting
      // to "Transaction" type.
      return TransactionBuilder.fromXDR(
        response.signed_envelope_xdr,
        Networks.PUBLIC,
      ) as Transaction;
    } catch (error) {
      const errorMsg = (error as any).toString();
      throw new Error(
        `We couldn’t sign the transaction with Albedo. ${errorMsg}.`,
      );
    }
  },
};
