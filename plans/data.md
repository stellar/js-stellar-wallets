# Data API

## Consistent shape of Token object

```typescript
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
```

## Consistent shape of Issuer object

```typescript
interface Issuer {
  key: string;
  name: string;
  url: string;
  hostName: string;
}
```

## Consistent identifier for tokens

```typescript
  getTokenIdentifier(token: Token): string => `#{token.code}:#{token.issuer.key}`
```

## Consistent shape of offer object

```typescript
interface Offer {
  baseToken: Token;
  counterToken: Token;
  timestamp: number;
  id: string;
}
```

Offers look strange when partially-filled, I think their IDs change? Might need to do some massaging to make
those implementation details opaque to the developer.

This might need to be a class instead of an object to support changes, or we could use Object.defineProperty
so users can detect changes:

https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty

## Consistent shape of TokenBalance object

```typescript
interface Balance {
  token: Token;
  sellingLiabilities: Big;

  // for non-native tokens, this should be total - sellingLiabilities
  // for native, it should also subtract the minimumBalance
  available: Big;
  total: Big;
}
```

XLM should also be represented by a similar object:

```typescript
interface NativeBalance extends Balance {
  minimumBalance: Big;
}
```

## Get a list of outstanding buy / sell offers for a given token

```typescript
function getOutstandingBuyOffers(
  tokenIdentifier: string
): Promise<Array<Offer>>;
```

Note that this function alone doesn't have a way to watch for updates; the dev will have to manually run another
function to watch for events.

## Get a live-updating count of all outstanding offers for an account

```typescript
function watchOfferCounts(callback: function): void;

// callback functions have this signature
function callback(count: number): void;
```

## For a given offer, run callback functions when it’s partially filled / totally filled / canceled

```typescript
  function watchOffer({
    onPartialFill: function,
    onComplete: function,
    onCancel: function,
  }): void

  // onPartialFill / onComplete / onCancel functions have this callback signature
  function callback(count: number): void
```

## Get a list of tokens you own with total owned, available balance

```typescript
  function getBalancesForAccount(accountId): Promise<Array<Balance>>

  // the watcher returns a function that you can run to cancel the watcher
  function watchBalancesForAccount(accountId, {
    onMessage: (balances: Array<Balance>),
  }): function
```
