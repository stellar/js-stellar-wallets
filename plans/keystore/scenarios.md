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

Encrypter: identity

KeyStore: local device storage

- initialized with null authToken
- setKey/getKey just store and read from JS memory
- only one key supported

KeyHandlers: plaintext, Trezor / Ledger

## StellarX: kk

Encrypter: identity

KeyStore: local device storage

- initialized with null authToken
- setKey/getKey just store and read from JS memory
- only one key supported

KeyHandlers: plaintext, Trezor / Ledger
