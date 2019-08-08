import { TransferResponseType } from "../constants/transfers";

export interface GetKycArgs {
  request: WithdrawRequest | DepositRequest;
  response: InteractiveKycNeededResponse;
  callback_url: string;
}

export interface FeeArgs {
  asset_code: string;
  amount: string;
  operation: "withdraw" | "deposit";
  type: string;
}

export interface RawInfoResponse {
  withdraw: {
    [asset_code: string]: {
      enabled: boolean;
      fee_fixed: number;
      fee_percent: number;
      min_amount: number;
      max_amount: number;
      authentication_required?: boolean;
      types?: {
        [type: string]: RawType;
      };
    };
  };
  deposit: {
    [asset_code: string]: {
      enabled: boolean;
      fee_fixed: number;
      fee_percent: number;
      min_amount: number;
      max_amount: number;
      authentication_required?: boolean;
      fields?: {
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
  asset_code: string;
  fee: Fee;
  min_amount: number;
  max_amount: number;
  types: WithdrawType[];
  authentication_required?: boolean;
}

export interface WithdrawInfo {
  [asset_code: string]: WithdrawAssetInfo;
}

export interface DepositAssetInfo {
  asset_code: string;
  fee: Fee;
  min_amount: number;
  max_amount?: number;
  fields: Field[];
  authentication_required?: boolean;
}

export interface DepositInfo {
  [asset_code: string]: DepositAssetInfo;
}

export interface WithdrawRequest {
  type: string;
  asset_code: string;
  dest: string;
  dest_extra: string;
  account?: string;
  memo?: Memo;
  memoType?: string;
  [key: string]: any;
}

export interface DepositRequest {
  asset_code: string;
  account: string;
  memo?: Memo;
  memoType?: string;
  emailAddress?: string;
  type?: string;
  [key: string]: any;
}

export interface TransferResponse {
  type:
    | TransferResponseType.ok
    | TransferResponseType.non_interactive_customer_info_needed
    | TransferResponseType.interactive_customer_info_needed
    | TransferResponseType.customer_info_status
    | TransferResponseType.error;
  error?: string;
}

export interface WithdrawOk extends TransferResponse {
  status: "ok";
  send_to: string;
  needs_memo: boolean;
  memo: Memo;
  eta?: number;
  min_amount?: number;
  max_amount?: number;
  fee: Fee;
  extraInfo?: {
    message: string;
  };
}

export interface DepositOk extends TransferResponse {
  how: string;
  eta?: number;
  min_amount?: number;
  max_amount?: number;
  fee_fixed?: number;
  fee_percent?: number;
  extra_info?: {
    message: string;
  };
}

export interface NonInteractiveKycNeededResponse extends TransferResponse {
  type: TransferResponseType.non_interactive_customer_info_needed;
  fields: string[]; // This can be restricted to the list of strings in SEP-9
  // tslint:disable-next-line max-line-length
  // https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0009.md#kyc--aml-fields
}

export interface InteractiveKycNeededResponse extends TransferResponse {
  type: TransferResponseType.interactive_customer_info_needed;
  url: string;
  interactive_deposit?: boolean;
}

export interface KycStatus extends TransferResponse {
  type: TransferResponseType.customer_info_status;
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

export interface NoneFee {
  type: "none";
}

export interface ComplexFee {
  type: "complex";
}

export interface SimpleFee {
  type: "simple";
  fixed?: number;
  percent?: number;
}

export type Fee = NoneFee | ComplexFee | SimpleFee;

export interface Memo {
  type: "text" | "id" | "hash";
  value: string;
}

export interface TransferError extends Error {
  originalResponse?: any;
}
