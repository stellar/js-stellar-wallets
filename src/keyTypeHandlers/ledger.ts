import LedgerTransport from "@ledgerhq/hq-transport-u2f";
import LedgerStr from "@ledgerhq/hw-app-str";
import { Transaction } from "stellar-base";
import StellarSdk from "stellar-sdk";

import { isLedgerKey } from "../KeyHelpers";
import { Key, KeyType, KeyTypeHandler } from "../types";

export const ledgerHandler: KeyTypeHandler = {
  keyType: KeyType.ledger,
  async signTransaction({
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

    /* 
      There's a naive way to do this (to keep all functions stateless and 
      make the connection anew each time), and there's some way of weaving state
      into this.

      Gonna do the naive thing first and then figure out how to do this right.
    */
    const transport = await LedgerTransport.create(60 * 1000);
    const ledgerApi = new LedgerStr(transport);
    const result = await ledgerApi.signTransaction(
      "44'/148'/0'",
      transaction.signatureBase(),
    );

    const keyPair = StellarSdk.Keypair.fromPublicKey(key.publicKey);
    const decoratedSignature = new StellarSdk.xdr.DecoratedSignature({
      hint: keyPair.signatureHint(),
      signature: result.signature,
    });
    transaction.signatures.push(decoratedSignature);

    console.log("key: ", key);
    return Promise.resolve(transaction);
  },
};
