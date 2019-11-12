# Data API

The Data API is meant to return readable, understandable processed Stellar data
from the network.

Some things we did to make the data more understandable:

- Trade data is from the point of view of the account you use to initiate the
  `DataProvider`. That means instead of indicating "sender" and "receiver",
  either of which could be your account, trades indicate a "payment token" (what
  you send) and an "incoming token" (what you receive).

## API surface

```typescript
const StellarWallets = {
  Data: {
    Types: {
      Token,
      Issuer,
      Offer,
      Trade,
      Payment,
      Balance,
      NativeBalance,
    },

    // stateless functions
    getTokenIdentifier,

    // this is a class, so you can set the Horizon server
    // we want to hit
    DataProvider: {
      // non-fetch functions
      isValidKey,
      getAccountKey,

      // fetch functions
      fetchOpenOffers,
      fetchTrades,
      fetchPayments,
      fetchEffects,
      fetchAccountDetails,

      // watchers
      watchOpenOffers,
      watchTrades,
      watchPayments,
      fetchEffects,
      watchAccountDetails,
    },
  },
};
```

## Consistent data shapes

```typescript
interface Account {
  publicKey: string;
}

interface Token {
  type: string; // or enum?
  code: string;
  issuer: Issuer;
  anchorAsset: string;
  numAccounts: Big;
  amount: Big;
  bidCount: number;
  askCount: number;
  spread: Big;
}

interface Issuer {
  key: string;
  name: string;
  url: string;
  hostName: string;
}

interface Effect {
  id: string;
  senderToken: Token;
  receiverToken: Token;
  senderAccount: Account;
  receiverAccount: Account;
  senderAmount: Big;
  receiverAmount: Big;
  timestamp: number;
}

interface Trade extends Effect {}

/*
  Offers look strange when partially-filled, I think their IDs change? Might need
  to do some work to hide unimportant implementation details from users.

  This might need to be a class instead of an object to support changes, or we
  could use Object.defineProperty so users can detect changes:

  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty
*/
interface Offer extends Effect {}

interface Payment extends Effect {
  paymentType: string; // or enum? basically, is this the "create account" payment
}

interface Balance {
  token: Token;
  sellingLiabilities: Big;

  // for non-native tokens, this should be total - sellingLiabilities
  // for native, it should also subtract the minimumBalance
  available: Big;
  total: Big;
}

// native XLM is similar to Balance
interface NativeBalance extends Balance {
  minimumBalance: Big;
}
```

## Stateless, side-effect-less helpers

### Get identifier for a token

This is useful for people to test token equality, create indices, etc.

```typescript
function getTokenIdentifier(token: Token): string {
  return `#{token.code}:#{token.issuer.key}`;
}
```

## Getters and watchers

### Get a list of outstanding buy / sell offers for a given token

```typescript
function fetchOpenOffers(tokenIdentifier: string): Promise<Offer[]>;

function watchOpenOffers({
  onPartialFill: (offers: Offers[]): void,

  /*
    These two get complicated: if an offer gets removed,
    it's not an open offer anymore. So we have a couple options:
    * Return `offers` and `trades` (the latter isn't a complete list)
    * Return `offers`, some of which may be completed
  */

  onComplete: (offers: Offers[]): void,
  onCancel: (offers: Offers[]): void,
}): void;

```

### Fetch lists of specific data

Data types:

- Trades: Two people exchange tokens
- Payments: One person sends a token to another
- Effects: All operations that change an account (like changing trust, changing
  inflation destination, etc.)

### Get a list of tokens you own with total owned, available balance

```typescript
  function fetchAccountDetails(): Promise<Array<Balance>>

  // the watcher returns a function that you can run to cancel the watcher
  function watchAccountDtails({
    onMessage: (balances) => Array<Balance>,
  }): function
```
