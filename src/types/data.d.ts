import BigNumber from "bignumber.js";
import { AssetType } from "stellar-base";
import { Horizon } from "stellar-sdk";
import { EffectType } from "../constants/data";

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

export interface AccountDetails {
  id: string;
  subentryCount: number;
  inflationDestination?: string;
  lastModifiedLedger: number;
  thresholds: Horizon.AccountThresholds;
  signers: Horizon.AccountSigner[];
  flags: Horizon.Flags;
  balances: BalanceMap;
}

export type Offers = Offer[];

export type Trades = Trade[];
