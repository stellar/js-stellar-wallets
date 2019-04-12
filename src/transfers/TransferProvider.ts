import queryString from "query-string";

import { parseInfo } from "./parseInfo";
import {
  DepositInfo,
  FeeArgs,
  Info,
  RawInfoResponse,
  WithdrawInfo,
} from "./types";

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
    const response = await fetch(
      `${this.transferServer}/fee?${queryString.stringify(args)}`,
    );
    const { fee } = await response.json();
    return fee as number;
  }
}
