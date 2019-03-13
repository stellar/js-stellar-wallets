# Overview

## Summary

The key store system is a client-side library that is designed to be modular
and extensible beyond all else. It makes it easy for a wallet app to store
different kinds of Stellar keys and their metadata in a variety of different
ways.

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
- Recovery of key if password is forgotten: user should also store key in separate paper wallet

## Pluggable components

* Key stores:
