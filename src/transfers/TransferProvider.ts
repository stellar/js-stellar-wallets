import queryString from "query-string";

import {
  DepositInfo,
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

  constructor(transferServer: string) {
    this.transferServer = transferServer;
  }

  protected async fetchInfo(): Promise<Info> {
    const response = await fetch(`${this.transferServer}/info`);
    const rawInfo = (await response.json()) as RawInfoResponse;

    return parseInfo(rawInfo);
  }

  public abstract fetchSupportedAssets():
    | Promise<WithdrawInfo>
    | Promise<DepositInfo>;

  protected async fetchFinalFee(args: FeeArgs): Promise<number> {
    const { supportedAssets, ...rest } = args;

    if (!supportedAssets[rest.assetCode]) {
      throw new Error(
        `Can't get fee for an unsupported asset, '${rest.assetCode}`,
      );
    }
    const { fee } = supportedAssets[rest.assetCode];
    switch (fee.type) {
      case "none":
        return 0;
      case "simple":
        const simpleFee = fee as SimpleFee;
        return (
          ((simpleFee.percent || 0) / 100) * Number(rest.amount) +
          (simpleFee.fixed || 0)
        );
      case "complex":
        const response = await fetch(
          `${this.transferServer}/fee?${queryString.stringify(rest)}`,
        );
        const { fee: feeResponse } = await response.json();
        return feeResponse as number;

      default:
        throw new Error(
          `Invalid fee type found! Got '${
            fee.type
          }' but expected one of 'none', 'simple', 'complex'`,
        );
    }
  }
}
