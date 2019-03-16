# Scenarios

This doc explores different kinds of wallets that may want to use the key
management API, and explains how to use the API to deal with the different
scenarios.

## Key Handlers

The key handlers are shared across all the different scenarios, so just define them up here

- plaintext key handler
  - takes the key object
  - creates a Stellar JS SDK KeyPair from it
  - signs the transaction with JS SDK sign method
  - returns signed transaction
- The Trezor / Ledger handlers
  - read the public key and path from key object
  - Use Ledger / Trezor JS libraries to transmit transaction and receive signed transaction
  - returns signed transaction

## StellarTerm

Properties

- local wallet
- no password
- no auth
- Trezor/Ledger support
- no MFA

Auth strategy: none

Encrypter: identity

KeyStore: local device storage

- initialized with null authToken
- setKey/getKey just store and read from JS memory
- only one key supported

KeyHandlers: plaintext, Trezor / Ledger

## StellarX

Auth strategy: none

Encrypter: identity

KeyStore: local device storage

- initialized with null authToken
- setKey/getKey just store and read from JS memory
- only one key supported

KeyHandlers: plaintext, Trezor / Ledger

## Stellar Wallet JS SDK

See
[stellar-wallet-js-sdk](https://github.com/stellar/stellar-wallet-js-sdk).
It's a system that combines auth functionality with storing your stellar
keys.

The integration strategy: any auth-related functionality is outside the scope of the keystore API. So the keystore plugin for stellar-wallet-js-sdk only implements the keystore-related calls, and a client can directly call stellar-wallet-js-sdk for auth-related tasks.
