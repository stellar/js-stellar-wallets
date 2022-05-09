import {
  TransactionStatus,
  TransferResponseType,
} from "../constants/transfers";
import { WatcherParams } from "./watchers";

export interface GetKycParams {
  request: WithdrawRequest | DepositRequest;
  response: InteractiveKycNeededResponse;
  callback_url: string;
}

export interface FetchKycInBrowserParams<T> {
  response: InteractiveKycNeededResponse;
  request: T;
  window: Window;
}

export interface FeeParams {
  asset_code: string;
  amount: string;
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
  withdraw: WithdrawAssetInfoMap;
  deposit: DepositAssetInfoMap;
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

export interface WithdrawAssetInfoMap {
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

export interface DepositAssetInfoMap {
  [asset_code: string]: DepositAssetInfo;
}

export interface WithdrawRequest {
  asset_code: string;
  type: string;
  dest: string;
  dest_extra: string;
  [key: string]: string;
}

export interface DepositRequest {
  asset_code: string;
  [key: string]: string;
}

export interface TransferResponse {
  type:
    | TransferResponseType.ok
    | TransferResponseType.non_interactive_customer_info_needed
    | TransferResponseType.interactive_customer_info_needed
    | TransferResponseType.customer_info_status
    | TransferResponseType.error;
  id?: string | number;
  error?: string;
  url?: string;
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

export interface AnchorUSDKycStatus extends TransferResponse {
  type: TransferResponseType.customer_info_status;
  status: "success" | "pending" | "denied";
  more_info_url?: string;
  eta?: number;
}

export type KycStatus = AnchorUSDKycStatus | Transaction;

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

export interface FieldPayload {
  [name: string]: string;
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

export interface RefundPayment {
  id: string;
  id_type: "stellar" | "external";
  amount: string;
  fee: string;
}

export interface Refunds {
  amount_refunded: string;
  amount_fee: string;
  payments: RefundPayment[];
}

interface BaseTransaction {
  id: string;
  status:
    | TransactionStatus.incomplete  
    | TransactionStatus.pending_user_transfer_start
    | TransactionStatus.pending_user_transfer_complete
    | TransactionStatus.pending_external
    | TransactionStatus.pending_anchor
    | TransactionStatus.pending_stellar
    | TransactionStatus.pending_trust
    | TransactionStatus.pending_user
    | TransactionStatus.completed
    | TransactionStatus.refunded
    | TransactionStatus.no_market
    | TransactionStatus.too_small
    | TransactionStatus.too_large
    | TransactionStatus.error;
  status_eta?: number;
  kyc_verified?: boolean;
  more_info_url?: string;
  amount_in?: string;
  amount_in_asset?: string;
  amount_out?: string;
  amount_out_asset?: string;
  amount_fee?: string;
  amount_fee_asset?: string;
  started_at?: string;
  completed_at?: string;
  stellar_transaction_id?: string;
  external_transaction_id?: string;
  message?: string;
  refunded?: boolean; // deprecated in favor of the refunds object below
  refunds?: Refunds;
  from?: string;
  to?: string;
  external_extra?: string;
  external_extra_text?: string;

  // these are off-spec props from certain anchors
  _id?: string;
  amount?: string;
}

export interface DepositTransaction extends BaseTransaction {
  kind: "deposit";
  deposit_memo?: string;
  deposit_memo_type?: string;
  claimable_balance_id?: string;
}

export interface WithdrawTransaction extends BaseTransaction {
  kind: "withdrawal";
  withdraw_anchor_account?: string;
  withdraw_memo?: string;
  withdraw_memo_type?: string;
}

export type Transaction = DepositTransaction | WithdrawTransaction;

export interface GetAuthStatusParams {
  asset_code: string;
}

export interface TransactionsParams {
  asset_code: string;
  show_all_transactions?: boolean;
  no_older_than?: string;
  limit?: number;
  kind?: string;
  paging_id?: string;
}

export interface TransactionParams {
  asset_code: string;
  id?: string;
  stellar_transaction_id?: string;
  external_transaction_id?: string;
}

export interface WatchAllTransactionsParams extends WatcherParams<Transaction> {
  asset_code: string;
  no_older_than?: string;
  watchlist?: string[];
  timeout?: number;
  isRetry?: boolean;
}

export interface WatchOneTransactionParams
  extends TransactionParams,
    WatcherParams<Transaction> {
  onSuccess: (payload: Transaction) => void;
  timeout?: number;
  isRetry?: boolean;
}
