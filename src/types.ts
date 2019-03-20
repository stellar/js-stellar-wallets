import BigNumber from "bignumber.js";

export interface IIssuer {
  key: string;
  name: string;
  url: string;
  hostName: string;
}

export interface IToken {
  type: string; // or enum?
  code: string;
  issuer: Issuer;
  anchorAsset: string;
  numAccounts: BigNumber;
  amount: BigNumber;
  bidCount: number;
  askCount: number;
  spread: BigNumber;
}
