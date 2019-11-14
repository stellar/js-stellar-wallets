# Changelog

## v0.0.7

- Rename WithdrawInfo to WithdrawAssetInfoMap
- Rename DepositInfo to DepositAssetInfoMap

## v0.0.6

- General: Get rid of export namespaces, since types weren't transfering over
  properly. We now export all helper functions, classes, etc. directly.
- General: Export `Types` object, which holds all types.
- Data: Add support for SEP-10 auth, via `KeyManager#fetchAuthToken`.
- Data: add an optional `network` property to keys; no network means assume
  pubnet.
- Data: Drop `KeyManager#loadAllKeyMetadata`; use `KeyManager#loadAllKeys`
  instead.
- Data: Encrypted keys now store a generic encrypted blob, which among other
  things keeps public keys private by default.
- Transfers: Add tools to watch pending transactions.
- Transfers: Use snake-cased arguments for transfers, since some of them are the
  same as snake-cased arguments requested by anchors.

## v0.0.3

Initial (official) release! 🎉

This early prototype includes the following functionality:

- Fetching data from the Stellar network
- Encrypting and storing secret keys
- Helpers for stepping through anchor deposits and withdraws

Future versions will refine the library's API and add functionality.
