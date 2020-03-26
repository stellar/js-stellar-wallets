# js-stellar-wallets

A library to make it easier to write your own Stellar wallets.

Docs: https://stellar-walletsdk-docs.netlify.com/

It provides straightforward APIs for handling these tasks:

- Fetching and formatting data from the Stellar network
- Encrypting and storing secret keys
- Transferring funds to and from the Stellar network

Some things the library will try to do well:

- Useful type definitions
- Consistent, descriptive names
- Do rote tasks automatically for the user
- Provide one obvious, streamlined way of accomplishing each task

This is not an attempt to replace `stellar-sdk`, it's meant to provide a better
API in some areas (data-fetching, transfers) and new functionality in others
(key management).

## Fetching and formatting data

Our library's goal is to provide typed, consistently-named Stellar data through
a consistent, predictable API.

Note that our goal was to name data properties to be _internally consistent_ and
intuitive, _not_ to be perfectly consistent with Horizon's responses. In some
cases (particularly around offer / trade history), properties were renamed for
clarity.

```js
import {
  getTokenIdentifier,
  getBalanceIdentifier,
  DataProvider,
} from "@stellar/wallet-sdk";

// You'll use your DataProvider instance to ask for data from Stellar.
const dataProvider = new DataProvider({
  serverUrl: "https://horizon.stellar.org",
  accountOrKey: "<<Insert public key>>",
});

// Some class functions will fetch data directly.
const offers = await dataProvider.fetchOpenOffers({
  limit: 20,
  order: "desc",
});

// Others will watch the network for changes and invoke callback when it happens.
dataProvider.watchAccountDetails({
  onMessage: (accountDetails) => {
    console.log("Latest account details: ", accountDetails);
  },
  onError: (err) => {
    console.log("error: ", err);
  },
});
```

## Encrypting and storing secret keys

Our KeyManager class allows you to securely encrypt keys client-side so you're
never sending sensitive information (the user's key or password) over the wire
in a raw state.

```js
import { KeyManager, KeyManagerPlugins, KeyType } from "@stellar/wallet-sdk";

// To instantiate a keyManager instance, pass it an object that conforms to
// the KeyStore interface.
const keyManager = new KeyManager({
  // The library comes with a sample KeyStore that stores keys in memory.
  keyStore: new KeyManagerPlugins.MemoryKeyStore(),
});

// Then, you need to register an encrypter to handle encrypting / decrypting keys.
// The library comes with two samples. (Don't use the Identity Encrypter in prod!)
keyManager.registerEncrypter(KeyManagerPlugins.ScryptEncrypter);

// If you're writing a production wallet, you'll probably want to write your own
// KeyStore and/or Encrypter. Make sure they conform to the `KeyStore` and
// `Encrypter` interfaces defined in these docs. You can use the `PluginTesting`
// functions to make sure that your plugins meet spec!

this.state.keyManager
  .storeKey({
    // The KeyManager takes keys that conform to our Key interface.
    key: {
      type: KeyType.plaintextKey,
      publicKey: "<<Insert public key>>",
      privateKey: "<<Insert private key>>",
    },

    password: "hunter2",
    encrypterName: KeyManagerPlugins.ScryptEncrypter.name,
  })
  .then((keyMetadata) => {
    console.log("Successfully encrypted and stored key: ", keyMetadata);
  })
  .catch((e) => {
    console.log("Error saving key: ", e.toString());
  });
```

## Transferring funds

Like the rest of the `@stellar/wallet-sdk`, the `Transfers` API is meant to
provide a predictable, easy-to-use interface.

```js
import {
  DepositProvider,
  WithdrawProvider,
  getKycUrl,
  TransferResultType,
} from "@stellar/wallet-sdk";

const withdrawProvider = new WithdrawProvider("<<Insert transfer server URL>>");

const supportedAssets = await withdrawProvider.fetchSupportedAssets();

console.log("This withdraw server supports these assets: ", supportedAssets);

const fee = await withdrawProvider.fetchFinalFee({
  assetCode: "<<Asset code>>",
  amount: "888.8",
  type: "<<Type comes from the supportedAssets list>>",
});

console.log("You will be charged a fee of ", fee, "of <<Asset code>>");

const withdrawResult = await withdrawProvider.withdraw({
  assetCode: "<<Asset code>>",
  amount: "888.8",
  type: "<<Type comes from the supportedAssets list>>",
  destination: "<<Withdrawal destination key>>",
});

switch (withdrawResult.type) {
  case TransferResultType.ok:
    // The withdraw request succeeded, so submit a payment to the network.
    // makePayment(withdrawResult);
    break;
  case TransferResultType.interactiveKyc:
    if (isBrowser) {
      // To avoid popup blockers, the new window has to be opened directly in
      // response to a user click event, so we need consumers to provide us a
      // window instance that they created previously. This could also be done in
      // an iframe or something.
      const popup = window.open("", "name", "dimensions etc");

      const kycResult = await withdrawProvider.fetchKycInBrowser({
        response: withdrawResult,
        window: popup,
      });

      // if deposit
      MyApp.showMessage(kycResult);

      // if withdraw, need to sign/submit transaction
      // (submitPayment is a placeholder function)
      MyApp.submitPayment({
        memo: kycResult.memo,
        destination: kycResult.accountId,
        amount,
      });
    } else if (isServerEnv || isNativeEnv) {
      const kycRedirect = getKycUrl({
        result: withdrawResult,
        request: withdrawRequest,
        callbackUrl,
      });
      /**
       * On e.g. react native, the client will have to open a webview manually
       * and pass a callback URL that the app has "claimed." This is very similar
       * to e.g. OAuth flows.
       * https://www.oauth.com/oauth2-servers/redirect-uris/redirect-uris-native-apps/
       * Include the original request so it can be provided as a querystring to
       * the callback URL. Simplifies re-submission dramatically after receiving
       * KYC results.
       */
    }
    break;
  case TransferResultType.nonInteractiveKyc:
    // TODO: SEP-12 data submission
    break;
  case TransferResultType.kycStatus:
    // The KYC information was previously submitted, but hasn't been approved
    // yet. Should show the user the pending status and any supplemental
    // information returned
    break;
  default:
  // There was an error.
}
```
