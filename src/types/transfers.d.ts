export interface GetKycArgs {
  request: WithdrawRequest | DepositRequest;
  response: InteractiveKycNeededResponse;
  callbackUrl: string;
}

export interface FeeArgs {
  supportedAssets: WithdrawInfo | DepositInfo;
  assetCode: string;
  amount: string;
  operation: "withdraw" | "deposit";
  type: string;
}

export interface RawInfoResponse {
  withdraw: {
    [assetCode: string]: {
      enabled: boolean;
      fee_fixed: number;
      fee_percent: number;
      min_amount: number;
      max_amount: number;
      types: {
        [type: string]: RawType;
      };
    };
  };
  deposit: {
    [assetCode: string]: {
      enabled: boolean;
      fee_fixed: number;
      fee_percent: number;
      min_amount: number;
      max_amount: number;
      fields: {
        [field: string]: RawField;
      };
    };
  };
  fee?: {
    enabled: boolean;
  };
  transactions?: {
    enabled: boolean;
  };
  transaction?: {
    enabled: boolean;
  };
}

export interface RawField {
  description: string;
  optional?: boolean;
  choices?: string[];
}

export interface RawType {
  fields: {
    [field: string]: RawField;
  };
}

export interface Info {
  withdraw: WithdrawInfo;
  deposit: DepositInfo;
  fee?: {
    enabled: boolean;
  };
  transactions?: {
    enabled: boolean;
  };
  transaction?: {
    enabled: boolean;
  };
}

export interface WithdrawAssetInfo {
  assetCode: string;
  fee: Fee;
  minAmount: number;
  maxAmount: number;
  types: WithdrawType[];
}

export interface WithdrawInfo {
  [assetCode: string]: WithdrawAssetInfo;
}

export interface DepositAssetInfo {
  assetCode: string;
  fee: Fee;
  minAmount: number;
  maxAmount: number;
  fields: Field[];
}

export interface DepositInfo {
  [assetCode: string]: DepositAssetInfo;
}

export interface WithdrawRequest {
  type: string;
  assetCode: string;
  dest: string;
  destExtra?: string;
  account?: string;
  memo: Memo;
}

export interface DepositRequest {
  assetCode: string;
  account: string;
  memo?: Memo;
  emailAddress?: string;
  type?: string;
}

export interface TransferResponse {
  type:
    | "ok"
    | "non_interactive_customer_info_needed"
    | "interactive_customer_info_needed"
    | "customer_info_status"
    | "error";
}

export interface WithdrawOk extends TransferResponse {
  status: "ok";
  sendTo: string;
  needsMemo: boolean;
  memo: Memo;
  eta?: number;
  minAmount?: number;
  maxAmount?: number;
  fee: Fee;
  extraInfo?: {
    message: string;
  };
}

export interface DepositOk extends TransferResponse {
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

export interface NonInteractiveKycNeededResponse extends TransferResponse {
  type: "non_interactive_customer_info_needed";
  fields: string[]; // This can be restricted to the list of strings in SEP-9
  // https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0009.md#kyc--aml-fields
}

export interface InteractiveKycNeededResponse extends TransferResponse {
  type: "interactive_customer_info_needed";
  url: string;
  interactiveDeposit?: boolean;
}

export interface KycStatus extends TransferResponse {
  type: "customer_info_status";
  more_info_url?: string;
  eta?: number;
}

export interface CustomerInfoStatus extends KycStatus {
  status: "pending" | "denied";
}

export interface KycPromptStatus extends KycStatus {
  status: "success" | "pending" | "denied";
}

export interface WithdrawType {
  name: string;
  fields: Field[];
}

export interface Field {
  name: string;
  description: string;
  optional?: boolean;
  choices?: string[];
}

export interface Fee {
  type: "none" | "simple" | "complex";
}

export interface SimpleFee extends Fee {
  type: "simple";
  fixed: number;
  percent: number;
}

export interface Memo {
  type: "text" | "id" | "hash";
  value: string;
}
