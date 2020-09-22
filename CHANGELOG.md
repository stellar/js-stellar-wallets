## In master

- [DataProvider] Added `type` and `mergedAccount` to `fetchPayments` response.

## [v0.2.0-rc.1](https://github.com/stellar/js-stellar-wallets/compare/v0.1.0-rc.1...v0.2.0-rc.1)

- [KeyManager] Added Trezor wallet.
- [KeyManager] Only sign SEP-10 auth transactions with seq number 0.
- [KeyManager] Require the auth server's key when fetching SEP-10 tokens, and
  check the challenge transaction is from that key and signed by it.
- [DataProvider] Fix `watchPayments` stopper.
- [KeyManager] Added Lyra wallet for key management.
- [KeyManager] Added Albedo wallet for key management.

## [v0.1.0-rc.1](https://github.com/stellar/js-stellar-wallets/compare/v0.0.9-rc.1...v0.1.0-rc.1)

**Breaking changes**:

- Upgraded `stellar-sdk` to 5.0.0.
- [DataProvider] Constructor now requires a `networkPassphrase` param.

Other changes:

- When parsing API responses, take extra care making sure that the responses are
  valid JSON, and throw if not.
- [DataProvider] Add memo information to payments.
- [DataProvider] Add `DataProvider#getStripAndMergeAccountTransaction`, a
  function that makes it easier to merge accounts with no balances but
  trustlines, outstanding offers, etc. Returns a transaction to strip and merge
  the account into another.
- [KeyManager] Correctly handle non-successful HTTP status codes when fetching
  auth tokens.
- [KeyManager] fetchAuthToken now accepts another account, if you're trying to
  auth another key that your KeyManager account is a signer on.
- [Transfers] Correctly handle non-successful HTTP status codes for
  transfer-related fetches.
- [Transfers] Make the transactions fetcher more resilient to invalid responses
  from /transactions.
- [Transfers] `DepositProvider` and `WithdrawProvider` instantiation now takes a
  third, optional parameter for
  [ISO 639-1](https://en.wikipedia.org/wiki/ISO_639-1) language codes. The
  default value is "en".
- [Transfers] `DepositProvider#startDeposit` and
  `WithdrawProvider#startWithdraw` can now add arbitrary headers to their
  requests.

## [v0.0.9-rc.1](https://github.com/stellar/js-stellar-wallets/compare/v0.0.8-rc.1...v0.0.9-rc.1)

- [General] Add support for building a commonjs bundle
- [Keys] Replace `KeyManager#loadAllKeys` with `loadKey` and `loadAllKeyIds`.
  This fixes a bug where a user wouldn't be able to save multiple keys with
  different passwords.
- [Transfers] Normalize some anchor transactions that almost meet SEP-24 spec
- [Transfers] Support fetching single transactions by their stellar id or
  external id
- [Transfers] Fix potential bugs with watching more than one transaction at a
  time
- [Transfers] Fix a bug where `TransferProvider#fetchTransaction` was expecting
  the wrong response shape from /transaction
- [Transfers] Add support for /deposit/interactive and /withdraw/interactive as
  transfer endpoints.
- [Transfers] Previously, we'd only require an auth token if an endpoint
  explicitly required it. Now, always require an auth token.

## [v0.0.8-rc.1](https://github.com/stellar/js-stellar-wallets/compare/v0.0.7-rc.1...v0.0.8-rc.1)

- [Data] Fix a bug where makeDisplayableTrades was outputting tokens with
  incorrectly-formatted `issuer` properties: the `issuer` object had in
  incorrect `publicKey` property that was renamed to the correct name `key`.
- [Transfers] Inject JWTs into interactive KYC URLs if not present
- [Transfers] Fix and standardize URL manipulation
- [Transfers} Add `TransferProvider#getKycUrl`, which uses the same URL as
  `fetchKycInBrowser`
- [Transfers] Fixes and improvements to fetchKycInBrowser / getKycUrl

## [v0.0.7-rc.1](https://github.com/stellar/js-stellar-wallets/compare/v0.0.6-rc.17...v0.0.7-rc.1)

- Rename some things for clarity
  - WithdrawInfo -> WithdrawAssetInfoMap
  - DepositInfo -> DepositAssetInfoMap
  - WithdrawProvider#withdraw -> #startWithdraw
  - DepositProvider#deposit -> #startDeposit
- Transfers: Fix fetchFinalFee parameters
- Transfers: Add `DepositProvider#validateFields` to validate deposit fields
- Transfers: Add `TransferProvider#getAssetInfo` to fetch single assets
- Transfers: If a deposit or withdraw requires auth and the interactive URL
  doesn't include a `jwt` property, add it
- Transfers: Fix a bug in `getKycUrl` where the URL manipulation wouldn't take
  into account certain URL shapes.
- Transfers: Add support for canonical SEP-24 transaction responses in
  fetchKycInBrowser
- Transfers: Add `TransferProvider#getKycUrl` so consumers can fetch KYC easier,
  even if they're not in a browser.
- `fetchKycInBrowser` and `getKycUrl` no longer need to be explicitly passed
  request and response; it'll read the stored values from the class.

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
