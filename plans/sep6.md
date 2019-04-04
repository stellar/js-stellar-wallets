## SEP-6 withdraw and deposit

Deposit and withdraw share a good number of steps and Transferresponse shapes,
meaning most of the API can be consistent across both.

### Types

```ts
type startWithdrawal = (transferServer: string) => PendingWithdrawal;
type startDeposit = (transferServer: string) => PendingDeposit;

type kycPrompt = (response: InteractiveKycNeeded) => Promise<KycPromptStatus>;
type getKycUrl = (
  response: InteractiveKycNeeded,
  callbackUrl: string,
) => string;

class PendingTransfer {
  supportedAssets: () => WithdrawInfo | DepositInfo;
  getFinalFee: (args: FeeArgs) => Promise<number>;
}

class PendingWithdrawal extends PendingTransfer {
  withdraw: (args: WithdrawRequest) => Promise<Request>;
}

class PendingDeposit extends PendingTransfer {
  deposit: (args: DepositRequest) => Promise<Request>;
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

// Retrieves /info and returns a class used to complete the withdrawal/deposit
const withdrawal = await startWithdrawal(transferServerUrl);
const deposit = await startDeposit(transferServerUrl);

// Returns `WithdrawalInfo`. Used to display options to the user, allowing an
// asset and withdrawal type to be selected.
withdrawal.supportedAssets();
deposit.supportedAssets();

// Returns a single number of how much the user will pay, in units of the asset
const fee = await withdrawal.getFinalFee({
  assetCode,
  amount,
  type,
});
const fee = await deposit.getFinalFee({
  assetCode,
  amount,
  type,
});

const result = await withdrawal.withdraw({ asset, destination, etc });

switch (result.type) {
  case RESPONSE_TYPES.ok:
    showUser(result);
    break;
  case RESPONSE_TYPES.interactiveKyc:
    if (isServerEnv) {
      const kycRedirect = getKycUrl(result, callbackUrl);
    } else if (isBrowser) {
      kycPrompt(result).then((kycResult) => {
        // KycPromptStatus
      });
    }
    break;
  case RESPONSE_TYPES.nonInteractiveKyc:
    // TODO: SEP-12 data submission
    break;
  case RESPONSE_TYPES.kycStatus:
    showUser(result);
    break;
}
```
