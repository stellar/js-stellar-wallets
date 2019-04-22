# Scenarios

This doc explores different kinds of wallets that may want to use the key
management API, and explains how to use the API to deal with the different
scenarios.

Each scenario must define the following to work with the key management API:

- one or more key handlers
- one or more encrypters
- a key store
- an auth strategy

## Key Handlers

The key handlers are shared across all the different scenarios, so just define
them up here

- plaintext key handler
  - takes the key object
  - creates a Stellar JS SDK KeyPair from it
  - signs the transaction with JS SDK sign method
  - returns signed transaction
- The Trezor / Ledger handlers
  - read the public key and path from key object
  - Use Ledger / Trezor JS libraries to transmit transaction and receive signed
    transaction
  - returns signed transaction

## Encrypters

A few standard encrypters:

- identity
  - does nothing, returns plaintext as the ciphertext
- StellarX-style
  - scrypts the password
  - encrypts the key with the scrypted password using nacl `box()`

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
- storeKeys/loadKey just store and read from JS memory
- only one key supported

KeyHandlers: plaintext, Trezor / Ledger

## StellarX

Auth strategy: AWS Cognito

Encrypter: StellarX-style

KeyStore: Keys stored in DynamoDB, accessed via AppSync GraphQL

- initialized with null authToken
- storeKeys/loadKey make authenticated calls to AppSync GraphQL endpoints
  - authentication is handled with singleton that makes AppSync calls, so no
    need to initialize any authToken in the KeyStore
- multiple keys are supported
- changePassword is handled in the usual way via `loadAllKeys()` and
  `storeKeys()`

KeyHandlers: plaintext, Trezor / Ledger

## Keybase

Auth strategy: Keybase's user management

Encrypter: Keybase gives each device a different private / public key pair. They
all have equal power, and are called sibling keys (sibkeys). Further, each
device has the publicKey for each other device. The
[KB key exchange doc](https://keybase.io/docs/crypto/key-exchange) explains this
more.

password: effectively uses this device's public / private key pair

`secretKey` in `IEncryptedKey`: string-encoded JSON mapping device name to
Stellar key encrypted with the given device's public key. This allows the
`secretKey` to store the Stellar key in a way that any device can decrypt it.

to encrypt:

- encrypt the Stellar secret key with the public keys for all devices
- this means the secret key is encrypted multiple ways, one per device

to decrypt:

- use the current device's name to look up the right encrypted key from the
  `secretKey` JSON
- decrypt it with the per-device privateKey

KeyStore: stored on KB's servers

- initialized with whatever auth-token KB uses
- storeKeys/loadKey
  - make authenticated calls to KB servers
- multiple keys can be supported (unlike now in KB, I believe)

KeyHandlers: plaintext, Trezor / Ledger

Cases to handle:

- password change
  - this doesn't affect the per-device keys, so no need to do anything
- change of keys for device
  - this reduces to `changePassword()` in the normal flow, so it is used as
    normal, passing the old `privateKey` in for `oldPassword`, and a
    string-encoded JSON mapping device name to public key for the `newPassword`.
    The map of course contains the new `publicKey` for this device.
- new device provisioned
  - called from outside of the Key Manager API
  - the provisioner must decrypt all Stellar secret keys
  - encrypt them using the new set of device encrypted keys and create a new
    `secretKey` entry in each `IEncryptedKey`
  - store the result to the server

## Stellar Wallet JS SDK

See [stellar-wallet-js-sdk](https://github.com/stellar/stellar-wallet-js-sdk).
It's a system that combines auth functionality with storing your stellar keys.

Unfortunately, it can't be straight-forwardly implemented using the KeyManager
API because encryption, auth, and key storage are all lumped together in
functions like `getWallet`. However, if encryption and key storage were exposed
separately with lower-level functions, one could build KeyManager-compatible
plugins.
