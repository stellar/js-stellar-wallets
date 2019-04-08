import BigNumber from "bignumber.js";
import { AssetType } from "stellar-base";

export type TradeId = string;
export type OfferId = string;

export interface KeyMap {
  [key: string]: any;
}

export enum EffectType {
  account_created = "account_created",
  account_credited = "account_credited",
  account_debited = "account_debited",
  account_home_domain_updated = "account_home_domain_updated",
  account_inflation_destination_updated = "account_inflation_destination_updated",
  account_removed = "account_removed",
  account_thresholds_updated = "account_thresholds_updated",
  signer_created = "signer_created",
  signer_removed = "signer_removed",
  signer_updated = "signer_updated",
  trade = "trade",
  trustline_created = "trustline_created",
  trustline_removed = "trustline_removed",
  trustline_updated = "trustline_updated",
}

export interface Account {
  publicKey: string;
}

export interface Issuer {
  key: string;
  name: string;
  url: string;
  hostName: string;
}

export interface NativeToken {
  type: AssetType;
  code: string;
}

export interface AssetToken {
  type: AssetType;
  code: string;
  issuer: Issuer;
  anchorAsset: string;
  numAccounts: BigNumber;
  amount: BigNumber;
  bidCount: BigNumber;
  askCount: BigNumber;
  spread: BigNumber;
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

export interface Trade {
  id: string;
  senderToken: Token;
  senderAccount: Account;
  senderAmount: BigNumber;
  senderOfferId?: OfferId;

  receiverToken: Token;
  receiverAccount: Account;
  receiverAmount: BigNumber;
  receiverOfferId?: OfferId;

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

export interface Balance {
  token: Token;
  sellingLiabilities: BigNumber;

  // for non-native tokens, this should be total - sellingLiabilities
  // for native, it should also subtract the minimumBalance
  available: BigNumber;
  total: BigNumber;
}

export interface Balance {
  // for non-native tokens, this should be total - sellingLiabilities
  // for native, it should also subtract the minimumBalance
  available: BigNumber;
  total: BigNumber;
  buyingLiabilities: BigNumber;
  sellingLiabilities: BigNumber;
}

export interface AssetBalance extends Balance {
  token: AssetToken;
}

export interface NativeBalance extends Balance {
  token: NativeToken;
  minimumBalance: BigNumber;
}

export interface BalanceMap {
  native: NativeBalance;
}

export type Offers = Offer[];

export type Trades = Trade[];
