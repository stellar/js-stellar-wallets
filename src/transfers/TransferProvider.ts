import queryString from "query-string";

import {
  DepositInfo,
  Fee,
  FeeArgs,
  Info,
  RawInfoResponse,
  SimpleFee,
  WithdrawInfo,
} from "../types";

import { parseInfo } from "./parseInfo";

/**
 * TransferProvider is the base class for WithdrawProvider and DepositProvider.
 */
export abstract class TransferProvider {
  public transferServer: string;
  public info?: Info;
  public bearerToken?: string;

  constructor(transferServer: string) {
    this.transferServer = transferServer;
  }

  protected async fetchInfo(): Promise<Info> {
    const response = await fetch(`${this.transferServer}/info`);
    const rawInfo = (await response.json()) as RawInfoResponse;
    const info = parseInfo(rawInfo);
    this.info = info;
    return info;
  }

  protected getHeaders(): Headers {
    return new Headers(
      this.bearerToken
        ? {
            Authorization: `Bearer ${this.bearerToken}`,
          }
        : {},
    );
  }

  public setBearerToken(token: string) {
    this.bearerToken = token;
  }

  public abstract fetchSupportedAssets():
    | Promise<WithdrawInfo>
    | Promise<DepositInfo>;

  protected async fetchFinalFee(args: FeeArgs): Promise<number> {
    if (!this.info || !this.info[args.operation]) {
      throw new Error("Run fetchSupportedAssets before running fetchFinalFee!");
    }

    const assetInfo = this.info[args.operation][args.asset_code];

    if (!assetInfo) {
      throw new Error(
        `Can't get fee for an unsupported asset, '${args.asset_code}`,
      );
    }
    const { fee } = assetInfo;
    switch (fee.type) {
      case "none":
        return 0;
      case "simple":
        const simpleFee = fee as SimpleFee;
        return (
          ((simpleFee.percent || 0) / 100) * Number(args.amount) +
          (simpleFee.fixed || 0)
        );
      case "complex":
        const response = await fetch(
          `${this.transferServer}/fee?${queryString.stringify(args as any)}`,
        );
        const { fee: feeResponse } = await response.json();
        return feeResponse as number;

      default:
        throw new Error(
          `Invalid fee type found! Got '${
            (fee as Fee).type
          }' but expected one of 'none', 'simple', 'complex'`,
        );
    }
  }
}
