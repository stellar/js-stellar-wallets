# Overview

## Summary

The key management system is a client-side library that is designed to be
modular and extensible beyond all else. It makes it easy for a wallet app to
store different kinds of Stellar keys and their metadata in a variety of
different ways.

## Requirements

- Modularity
- Extensibility
- Support multiple keys
- Support multiple devices
- Support for multiple kinds of keys:
  - Ledger/Trezor
  - Entered as plaintext
  - From key storage file
- Support for multiple key & metadata stores:
  - server
  - local disk
- Non-custodial
  - Encryption / decryption of keys happens on device / client, not in server
- Can sign transactions
- Interface with any external user management system

## Non-goals

- User management (this is handled externally)
- Recovery of key if password is forgotten:
  - user should also store key in separate paper wallet
  - or just use a Ledger / Trezor

## Pluggable components

Below are various pluggable components that we should be able to handle.

- Key stores:
  - in browser memory (like StellarTerm)
  - local storage in browser
  - on device in a mobile app
  - in a database or blob store on a server
  - A system that combines auth & key storage, like
    [stellar-wallet-js-sdk](https://github.com/stellar/stellar-wallet-js-sdk)
- encryption algorithms:
  - identity (does nothing)
  - Keybase / StellarX-style using nacl box/unbox
- Types of keys:
  - Ledger / Trezor
  - plain text (S...)
  - standard file format(s)
    [Protocol Issue](https://github.com/stellar/stellar-protocol/issues/198),
    [Stellarport's format](https://github.com/stellarport/stellar-keystore/blob/master/audit.pdf)
