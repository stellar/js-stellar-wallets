import BigNumber from "bignumber.js";

export enum TokenType {
  native = "native",
  credit_alphanum4 = "credit_alphanum4",
  credit_alphanum12 = "credit_alphanum12",
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

export interface Token {
  type: TokenType;
  code: string;
  issuer?: Issuer;
  anchorAsset?: string;
  numAccounts?: BigNumber;
  amount?: BigNumber;
  bidCount?: BigNumber;
  askCount?: BigNumber;
  spread?: BigNumber;
}

export interface Effect {
  id: string;
  type: EffectType;
  senderToken: Token;
  receiverToken: Token;
  senderAccount: Account;
  receiverAccount: Account;
  senderAmount: BigNumber;
  receiverAmount: BigNumber;
  timestamp: number;
}

export interface ReframedEffect {
  id: string;
  type: EffectType;
  baseToken: Token;
  token: Token;
  amount: BigNumber;
  price: BigNumber;
  sender: Account;
  timestamp: number;
}
