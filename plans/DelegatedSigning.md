# DelegatedSigning API

This is an API to help wallets implement SEP-7 support:
https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0007.md

TODO: Use this as a guide for a ref implementation:
https://gist.github.com/nikhilsaraf/ff3ae46116b6ae6dbdcd1743ad9495ec

## API surface

```typescript

/* --------- CONSUMING A URI --------- */

/**
 * Given a full URI path, validate it to make sure the signature matches the
 * transaction, that an origin domain exists, that the tx contains all the
 * needed information, etc.
 *
 * If the URI is invalid, the function should throw instead of returning false.
 *
 * This needs a way to fetch the signing key of the originDomain. Maybe it fetches
 * it itself from the toml file.
 */
validateURI(uri: string): boolean

/**
 * Given a full URI path, convert it to a `stellar-base`-generated
 * `Tranasaction` class instance. If account fields are zeroed out, this func
 * should replace them with the given account info.
 *
 * It's possible we don't want to return the Transaction directly, but instead
 * an object `{ transaction, callback }` (in case there's a callback). We'll
 * need to investigate this further.
 *
 * It's the application's reponsibility to solicit the user's signature and
 * either submit the result to the network, or to the callback.
 */
getTransactionFromURI({}: { uri: string, account: StellarBase.Account })


/* --------- GENERATING A URI --------- */

/**
 * Return a URI path for a Transaction / Pay and a memo id to watch.
 *
 * It should then be the wallet's responsibility to check for that memo id.
 *
 * This is a little complicated because we might need to support callback URIs
 * (which have to be implemented full-stack instead of in one session).
 *
 * These instructions maybe have to support only text memos, because otherwise
 * I'm not sure how to inject and watch a specific memo ID.
 */
generateTransactionURI({}: {
  // note that the function is going to append our new memo id to the transaction
  transaction: Transaction;

  // Since we're adding a memo to the TX, this function has to sign the URI
  // so we need the domain's signing key to do that.
  requestSigningKeypair: Keypair;

  callback: string;
  publicKey: string;
  message: string;
  networkPassphrase: string;
  originDomain: string;

}): { memoId: string; uri: string; }

generatePayURI({}: {
  destination: Account | string;
  amount?: string;
  asset?: Asset;

  // Since we're adding a memo to the TX, this function has to sign the URI
  // so we need the domain's signing key to do that.
  requestSigningKeypair: Keypair;

  callback: string;
  message: string;
  networkPassphrase: string;
  originDomain: string;

}): { memoId: string; uri: string; }

/**
 * Watch the Stellar network for a transaction with the given memoId.
 * Will only analyze transactions that come in going forward; doesn't go back
 * in time.
 */
watchForMemoId(memoId: string): Promise<Effect>


```
