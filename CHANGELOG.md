# Changelog

## [Current](https://github.com/stellar/js-stellar-wallets/compare/v0.0.6-rc.17...master)

- Rename some things for clarity
  - WithdrawInfo -> WithdrawAssetInfoMap
  - DepositInfo -> DepositAssetInfoMap
  - WithdrawProvider#withdraw -> #startWithdraw
  - DepositProvider#deposit -> #startDeposit

## [v0.0.6-rc.17](https://github.com/stellar/js-stellar-wallets/compare/v0.0.3-rc1...v0.0.6-rc.17)

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
- Data: Rename "transfers" (what we call direct and path payments and other
  similar operations) to "payments", so as to not confuse with the Transfers
  arm.
- Transfers: Add tools to watch pending transactions.
- Transfers: Use snake-cased arguments for transfers, since some of them are the
  same as snake-cased arguments requested by anchors.

## v0.0.3-rc.1

Initial (official) release! 🎉

This early prototype includes the following functionality:

- Fetching data from the Stellar network
- Encrypting and storing secret keys
- Helpers for stepping through anchor deposits and withdraws

Future versions will refine the library's API and add functionality.
