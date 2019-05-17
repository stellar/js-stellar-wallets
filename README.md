# js-stellar-wallets

A library to make it easier to write your own Stellar wallets.

It provides straightforward APIs for handling these tasks:

- Fetching and formatting data from the Stellar network
- Encrypting and storing secret keys
- Transferring funds to and from the Stellar network

## Fetching and formatting data

```js
import { Data } from "@stellar/wallet-sdk";

const {
  getTokenIdentifier,
  getBalanceIdentifier,
  reframeEffect,
  DataProvider,
} = Data;

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

```js
import { KeyManager, KeyManagerPlugins, Constants } from "@stellar/wallet-sdk";

const keyManager = new KeyManager({
  keyStore: new KeyManagerPlugins.MemoryKeyStore(),
});

keyManager.registerEncrypter(KeyManagerPlugins.ScryptEncrypter);

this.state.keyManager
  .storeKeys({
    key: {
      type: Constants.KeyType.plaintextKey,
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

```js
import { Transfers, Constants } from "@stellar/wallet-sdk";

const { DepositProvider, WithdrawProvider, getKycUrl } = Transfers;

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
  case Constants.TransferResultType.ok:
    // The withdraw request succeeded, so submit a payment to the network.
    // makePayment(withdrawResult);
    break;
  case Constants.TransferResultType.interactiveKyc:
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
      showUser(kycResult);

      // if withdraw, need to sign/submit transaction
      // (submitPayment is a placeholder function)
      submitPayment({
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
  case Constants.TransferResultType.nonInteractiveKyc:
    // TODO: SEP-12 data submission
    break;
  case Constants.TransferResultType.kycStatus:
    // The KYC information was previously submitted, but hasn't been approved
    // yet. Should show the user the pending status and any supplemental
    // information returned
    break;
  default:
  // There was an error.
}
```
