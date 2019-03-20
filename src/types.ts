import BigNumber from "bignumber.js";

export interface Issuer {
  key: string;
  name: string;
  url: string;
  hostName: string;
}

export interface Token {
  type: "native" | "credit_alphanum4" | "credit_alphanum12"; // or enum?
  code: string;
  issuer: Issuer;
  anchorAsset: string;
  numAccounts: BigNumber;
  amount: BigNumber;
  bidCount: number;
  askCount: number;
  spread: BigNumber;
}
