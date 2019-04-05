## SEP-6 withdraw and deposit

Deposit and withdraw share a good number of steps and Transferresponse shapes,
meaning most of the API can be consistent across both.

The high-level flow is:

- Fetch supported assets
- User picks deposit/withdrawal type, provides amount/destination
  - Fetch/calculate final fee
- Submit request, and depending on the response:
  - if KYC
    - if manual
      - Redirect to KYC form
      - User submits KYC info
      - Redirect back to wallet
      - (go to "if ok")
    - if automatic
      - ([SEP-12](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0012.md)
        is still TODO)
    - if pending
      - "KYC is pending, we're checking for updates"
      - link to more info if available
    - if denied
      - "KYC failed"
      - link to more info if available
  - if ok
    - Display how for deposits, submit transaction to the network for
      withdrawals

### Types

```ts
type kycPrompt = (response: InteractiveKycNeeded) => Promise<KycPromptStatus>;
type getKycUrl = (
  response: InteractiveKycNeeded,
  callbackUrl: string,
) => string;

class TransferProvider {
  constructor(transferServer) {}
  fetchSupportedAssets: () => Promise<WithdrawInfo> | Promise<DepositInfo>;
  fetchFinalFee: (args: FeeArgs) => Promise<number>;
}

class WithdrawProvider extends TransferProvider {
  withdraw: (args: WithdrawRequest) => Promise<TransferResponse>;
}

class DepositProvider extends TransferProvider {
  deposit: (args: DepositRequest) => Promise<TransferResponse>;
}

interface FeeArgs {
  assetCode: string;
  amount: string;
  operation: "withdraw" | "deposit";
  type: "string";
}

interface WithdrawAssetInfo {
  assetCode: string;
  fee: Fee;
  minAmount: number;
  maxAmount: number;
  types: {
    name: string;
    fields: Field[];
  }[];
}

interface WithdrawInfo {
  [assetCode: string]: WithdrawAssetInfo;
}

interface DepositAssetInfo {
  assetCode: string;
  fee: Fee;
  minAmount: number;
  maxAmount: number;
  fields: Field[];
}

interface DepositInfo {
  [assetCode: string]: DepositAssetInfo;
}

interface WithdrawRequest {
  type: string;
  assetCode: string;
  dest: string;
  destExtra?: string;
  account?: string;
  memo: Memo;
}

interface DepositRequest {
  assetCode: string;
  account: string;
  memo?: Memo;
  emailAddress?: string;
  type?: string;
}

type responseTypes =
  | "ok"
  | "non_interactive_customer_info_needed"
  | "interactive_customer_info_needed"
  | "customer_info_status"
  | "error";

interface TransferResponse {
  type: responseTypes;
}

interface WithdrawOk extends TransferResponse {
  status: "ok";
  sendTo: string;
  needsMemo: boolean;
  memo: Memo;
  eta?: number;
  minAmount?: number;
  maxAmount?: number;
  fee: Fee;
  extraInfo?;
}

interface DepositOk extends TransferResponse {
  how: string;
  eta?: number;
  minAmount?: number;
  maxAmount?: number;
  feeFixed?: number;
  feePercent?: number;
  extraInfo?: {
    message: string;
  };
}

interface NonInteractiveKycNeeded extends TransferResponse {
  type: "non_interactive_customer_info_needed";
  fields: string[]; // This can be restricted to the list of strings in SEP-9
  // https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0009.md#kyc--aml-fields
}

interface InteractiveKycNeeded extends TransferResponse {
  type: "interactive_customer_info_needed";
  url: string;
  interactiveDeposit?: boolean;
}

interface KycStatus extends TransferResponse {
  type: "customer_info_status";
  more_info_url?: string;
  eta?: number;
}

interface CustomerInfoStatus extends KycStatus {
  status: "pending" | "denied";
}

interface KycPromptStatus extends KycStatus {
  status: "success" | "pending" | "denied";
}

interface Field {
  name: string;
  description: string;
  optional?: boolean;
  choices?: [string];
}

interface Fee {
  type: "none" | "simple" | "complex";
}

interface SimpleFee extends Fee {
  type: "simple";
  fixed: number;
  percent: number;
}

interface Memo {
  type: "text" | "id" | "hash";
  value: string;
}
```

### Usage

```js
import { startWithdrawal, startDeposit, RESPONSE_TYPES } from "wallet-sdk";

const withdrawProvider = new WithdrawProvider(transferServerUrl);
const depositProvider = new DepositProvider(transferServerUrl);

// Retrieve supported assets. Used to display options to the user, including
// things like simple fees, asset codes, and withdrawal types.
await withdrawProvider.fetchSupportedAssets();
await depositProvider.fetchSupportedAssets();

// Returns a single number of how much the user will pay, in units of the asset
fee = await withdrawProvider.fetchFinalFee({
  assetCode,
  amount,
  type,
});
fee = await depositProvider.fetchFinalFee({
  assetCode,
  amount,
  type,
});

/**
 * Deposit just needs to display information to the user for them to complete on
 * their own, but withdraw needs to actually submit a transaction, so the code
 * paths are a little bit different.
 */
const depositResult = await depositProvider.withdraw({
  asset,
  destination,
  etc,
});
const withdrawResult = await withdrawProvider.withdraw({
  asset,
  destination,
  etc,
});

switch (depositResult.type /* or withdrawResult */) {
  case RESPONSE_TYPES.ok:
    // if deposit
    showUser(depositResult);

    // if withdraw, need to sign/submit transaction
    submitPayment({
      memo: withdrawResult.memo,
      destination: withdrawResult.accountId,
      amount,
    });
    break;
  case RESPONSE_TYPES.interactiveKyc:
    if (isBrowser) {
      // To avoid popup blockers, the new window has to be opened directly in
      // response to a user click event, so we need consumers to provide us a
      // window instance that they created previously.
      const popup = window.open("", "name", "dimensions etc");

      const kycResult = await withdrawProvider.kycPrompt(withdrawResult, popup);

      // if deposit
      showUser(kycResult);

      // if withdraw, need to sign/submit transaction
      submitPayment({
        memo: kycResult.memo,
        destination: kycResult.accountId,
        amount,
      });
    } else if (isServerEnv || isNativeEnv) {
      const kycRedirect = getKycUrl(withdrawResult, callbackUrl);
      /**
       * On e.g. react native, the client will have to open a webview manually
       * and pass a callback URL that the app has "claimed." This is very similar
       * to e.g. OAuth flows.
       * https://www.oauth.com/oauth2-servers/redirect-uris/redirect-uris-native-apps/
       * This adds a lot of friction though. They'll have to re-submit the
       * withdraw/deposit request in order to get the correct information, which
       * may be tricky because of the redirection involved.
       */
    }
    break;
  case RESPONSE_TYPES.nonInteractiveKyc:
    // TODO: SEP-12 data submission
    break;
  case RESPONSE_TYPES.kycStatus:
    showUser(whateverResult);
    break;
}
```
