import BigNumber from "bignumber.js";
import { AssetType, Memo, MemoType } from "stellar-base";
import {
  BadRequestError,
  Horizon,
  NetworkError,
  NotFoundError,
  ServerApi,
} from "stellar-sdk";
import { EffectType } from "../constants/data";

interface NotFundedError {
  isUnfunded: boolean;
}

export type FetchAccountError =
  | BadRequestError
  | NetworkError
  | (NotFoundError & NotFundedError);

export type TradeId = string;
export type OfferId = string;

export interface KeyMap {
  [key: string]: any;
}

export interface Account {
  publicKey: string;
}

export interface Issuer {
  key: string;
  name?: string;
  url?: string;
  hostName?: string;
}

export interface NativeToken {
  type: AssetType;
  code: string;
}

export interface AssetToken {
  type: AssetType;
  code: string;
  issuer: Issuer;
  anchorAsset?: string;
  numAccounts?: BigNumber;
  amount?: BigNumber;
  bidCount?: BigNumber;
  askCount?: BigNumber;
  spread?: BigNumber;
}

export type Token = NativeToken | AssetToken;

export interface Effect {
  id: string;
  type?: EffectType;
  senderToken: Token;
  receiverToken: Token;
  senderAccount: Account;
  receiverAccount?: Account;
  senderAmount: BigNumber;
  receiverAmount: BigNumber;
  timestamp: number;
}

export interface ReframedEffect {
  id: string;
  type?: EffectType;
  baseToken: Token;
  token: Token;
  amount: BigNumber;
  price: BigNumber;
  sender?: Account;
  timestamp: number;
}

/**
 * Trades are framed in terms of the account you used to initiate DataProvider.
 * That means that a trade object will say which token was your "payment" in
 * the exchange (the token and amount you sent to someone else) and what was
 * "incoming".
 */
export interface Trade {
  id: string;

  paymentToken: Token;
  paymentAmount: BigNumber;
  paymentOfferId?: OfferId;

  incomingToken: Token;
  incomingAccount: Account;
  incomingAmount: BigNumber;
  incomingOfferId?: OfferId;

  timestamp: number;
}

export interface Offer {
  id: OfferId;
  offerer: Account;
  paymentToken: Token;
  incomingToken: Token;
  incomingTokenPrice: BigNumber;
  incomingAmount: BigNumber;
  paymentAmount: BigNumber;
  initialPaymentAmount: BigNumber;
  timestamp: number;

  resultingTrades: TradeId[];
}

export interface Payment {
  id: string;
  isInitialFunding: boolean;
  isRecipient: boolean;

  token: Token;
  amount: BigNumber;
  timestamp: number;
  otherAccount: Account;

  sourceToken?: Token;
  sourceAmount?: BigNumber;

  transactionId: string;
  type: Horizon.OperationResponseType;

  memo?: Memo | string;
  memoType?: MemoType;

  mergedAccount?: Account;
}

export interface Balance {
  token: Token;

  // for non-native tokens, this should be total - sellingLiabilities
  // for native, it should also subtract the minimumBalance
  available: BigNumber;
  total: BigNumber;
  buyingLiabilities: BigNumber;
  sellingLiabilities: BigNumber;
}

export interface AssetBalance extends Balance {
  token: AssetToken;
  sponsor?: string;
}

export interface NativeBalance extends Balance {
  token: NativeToken;
  minimumBalance: BigNumber;
}

export interface BalanceMap {
  [key: string]: AssetBalance | NativeBalance;
  native: NativeBalance;
}

export interface AccountDetails {
  id: string;
  subentryCount: number;
  sponsoringCount: number;
  sponsoredCount: number;
  inflationDestination?: string;
  thresholds: Horizon.AccountThresholds;
  signers: ServerApi.AccountRecordSigners[];
  flags: Horizon.Flags;
  balances: BalanceMap;
  sequenceNumber: string;
}

export interface CollectionParams {
  limit?: number;
  order?: "desc" | "asc";
  cursor?: string;
}

export interface Collection<Record> {
  next: () => Promise<Collection<Record>>;
  prev: () => Promise<Collection<Record>>;
  records: Record[];
}
