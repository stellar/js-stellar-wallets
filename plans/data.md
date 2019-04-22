# Data API

## API surface

```typescript
const StellarWallets = {
  Data: {
    Types: {
      Token,
      Issuer,
      Offer,
      Trade,
      Transfer,
      Balance,
      NativeBalance,
    },

    // stateless functions
    getTokenIdentifier,
    reframeEffect,

    // this is a class, so you can set the Horizon server
    // we want to hit
    DataProvider: {
      // non-fetch functions
      isValidKey,
      getAccountKey,

      // fetch functions
      fetchOpenOffers,
      fetchTrades,
      fetchTransfers,
      fetchEffects,
      fetchAccountDetails,

      // watchers
      watchOpenOffers,
      watchTrades,
      watchTransfers,
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

interface Transfer extends Effect {
  transferType: string; // or enum? basically, is this the "create account" transfer
}

interface ReframedEffect {
  id: string;
  baseToken: Token;
  token: Token;
  amount: Big;
  price: Token;
  sender: Account;
  timestamp: number;
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

### Reframe an effect from the point of view of an account

Effect-like objects by default have a "sender" and "receiver", but most of the
time, wallets only care about showing "what did YOU send/receive." So this is a
way of turning "senderAmount // receiverAmount" into "amount // price".

```typescript
function reframeEffect(
  observerAccount: Account,
  effect: Effect,
): ReframedEffect;
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
- Transfers: One person sends a token to another
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
