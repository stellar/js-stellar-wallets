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
      // functions
      getOutstandingBuyOffers,
      watchOfferCounts,
      watchOffer,
      getBalances,
      watchBalances,
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
function getOutstandingBuyOffers(
  tokenIdentifier: string,
): Promise<Array<Offer>>;
```

Note that this function alone doesn't have a way to watch for updates; the dev
will have to manually run another function to watch for events.

### Get a live-updating count of all outstanding offers for an account

```typescript
function watchOfferCounts(callback: function): void;

// callback functions have this signature
function callback(count: number): void;
```

### For a given offer, run callback functions when it’s partially filled / totally filled / canceled

```typescript
  function watchOffer({
    onPartialFill: function,
    onComplete: function,
    onCancel: function,
  }): void

  // onPartialFill / onComplete / onCancel functions have this callback signature
  function callback(count: number): void
```

### Get a list of tokens you own with total owned, available balance

```typescript
  function getBalances(): Promise<Array<Balance>>

  // the watcher returns a function that you can run to cancel the watcher
  function watchBalances({
    onMessage: (balances) => Array<Balance>,
  }): function
```
