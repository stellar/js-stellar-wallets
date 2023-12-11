import LedgerStr from "@ledgerhq/hw-app-str";
import LedgerTransport from "@ledgerhq/hw-transport-u2f";
import * as StellarSdk from "@stellar/stellar-sdk";

import { HandlerSignTransactionParams, KeyTypeHandler } from "../types";

import { KeyType } from "../constants/keys";

export const ledgerHandler: KeyTypeHandler = {
  keyType: KeyType.ledger,
  async signTransaction(params: HandlerSignTransactionParams) {
    const { transaction, key } = params;

    if (key.privateKey !== "") {
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
      key.path,
      transaction.signatureBase(),
    );

    const keyPair = StellarSdk.Keypair.fromPublicKey(key.publicKey);
    const decoratedSignature = new StellarSdk.xdr.DecoratedSignature({
      hint: keyPair.signatureHint(),
      signature: result.signature,
    });
    transaction.signatures.push(decoratedSignature);

    return Promise.resolve(transaction);
  },
};
