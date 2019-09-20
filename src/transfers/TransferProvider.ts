import queryString from "query-string";

import {
  DepositInfo,
  Fee,
  FeeArgs,
  Info,
  RawInfoResponse,
  SimpleFee,
  Transaction,
  TransactionArgs,
  WithdrawInfo,
} from "../types";

import { parseInfo } from "./parseInfo";

/**
 * TransferProvider is the base class for WithdrawProvider and DepositProvider.
 */
export abstract class TransferProvider {
  public transferServer: string;
  public operation: "deposit" | "withdraw";
  public info?: Info;
  public bearerToken?: string;

  constructor(transferServer: string, operation: "deposit" | "withdraw") {
    this.transferServer = transferServer;
    this.operation = operation;
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

  public async fetchTransactions(
    args: TransactionArgs,
  ): Promise<Transaction[]> {
    if (!args.asset_code) {
      throw new Error("Required parameter `asset_code` not provided!");
    }
    if (!args.account) {
      throw new Error("Required parameter `account` not provided!");
    }

    if (!this.info || !this.info[this.operation]) {
      throw new Error("Run fetchSupportedAssets before running fetchFinalFee!");
    }

    const assetInfo = this.info[this.operation][args.asset_code];

    if (!assetInfo) {
      throw new Error(
        `Asset ${args.asset_code} is not supported by ${this.transferServer}`,
      );
    }

    const isAuthRequired = assetInfo.authentication_required;

    // if the asset requires authentication, require an auth_token
    if (isAuthRequired && !this.bearerToken) {
      throw new Error(
        `Asset ${
          args.asset_code
        } requires authentication, but auth_token param not supplied.`,
      );
    }

    const response = await fetch(
      `${this.transferServer}/transactions?${queryString.stringify(
        args as any,
      )}`,
      {
        headers: isAuthRequired ? this.getHeaders() : undefined,
      },
    );

    const { transactions } = await response.json();

    return transactions.filter(
      (transaction: Transaction) =>
        args.show_all_transactions ||
        (this.operation === "deposit" && transaction.kind === "deposit") ||
        (this.operation === "withdraw" && transaction.kind === "withdrawal"),
    ) as Transaction[];
  }

  public async fetchFinalFee(args: FeeArgs): Promise<number> {
    if (!this.info || !this.info[this.operation]) {
      throw new Error("Run fetchSupportedAssets before running fetchFinalFee!");
    }

    const assetInfo = this.info[this.operation][args.asset_code];

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
