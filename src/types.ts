import BigNumber from "bignumber.js";

export interface IIssuer {
  key: string;
  name: string;
  url: string;
  hostName: string;
}

export interface IToken {
  type: "native" | "credit_alphanum4" | "credit_alphanum12"; // or enum?
  code: string;
  issuer: IIssuer;
  anchorAsset: string;
  numAccounts: BigNumber;
  amount: BigNumber;
  bidCount: number;
  askCount: number;
  spread: BigNumber;
}
