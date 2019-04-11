import queryString from "query-string";

import { Omit } from "../util";
import { fetchKycInBrowser } from "./fetchKycInBrowser";
import { TransferProvider } from "./TransferProvider";
import {
  DepositRequest,
  FeeArgs,
  InteractiveKycNeeded,
  TransferResponse,
} from "./types";

export class DepositProvider extends TransferProvider {
  public async deposit(args: DepositRequest): Promise<TransferResponse> {
    const search = queryString.stringify(args);
    const response = await fetch(`${this.transferServer}/deposit?${search}`);
    return response.json();
  }

  public async fetchSupportedAssets() {
    const { deposit } = await this.fetchInfo();
    return deposit;
  }

  public async fetchFinalFee(args: Omit<FeeArgs, "operation">) {
    return super.fetchFinalFee({
      ...args,
      operation: "deposit",
    });
  }

  public async fetchKycInBrowser({
    response,
    request,
    window: windowContext,
  }: {
    response: InteractiveKycNeeded;
    request: DepositRequest;
    window: Window;
  }) {
    const kycResult = await fetchKycInBrowser({
      response,
      window: windowContext,
    });
    switch (kycResult.status) {
      case "denied":
        return Promise.reject(kycResult);
      case "pending":
        return Promise.reject(kycResult);
      case "success": {
        const retryResponse = await this.deposit(request);
        // Since we've just successfully KYC'd, the only expected response is
        // success. Reject anything else.
        if (retryResponse.type === "ok") {
          return retryResponse;
        }
        return Promise.reject(retryResponse);
      }
      default:
        throw new Error(
          `Invalid KYC response received: '${kycResult.status}'.`,
        );
    }
  }
}
