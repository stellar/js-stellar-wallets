import BigNumber from "bignumber.js";

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
  type: "native" | "credit_alphanum4" | "credit_alphanum12"; // or enum?
  code: string;
  issuer?: Issuer;
  anchorAsset?: string;
  numAccounts?: BigNumber;
  amount?: BigNumber;
  bidCount?: number;
  askCount?: number;
  spread?: BigNumber;
}

export interface Effect {
  id: string;
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
  baseToken: Token;
  token: Token;
  amount: BigNumber;
  price: BigNumber;
  sender: Account;
  timestamp: number;
}
