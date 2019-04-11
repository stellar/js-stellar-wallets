import queryString from "query-string";

import { Omit } from "../util";
import { fetchKycInBrowser } from "./fetchKycInBrowser";
import { TransferProvider } from "./TransferProvider";
import {
  FeeArgs,
  InteractiveKycNeeded,
  TransferResponse,
  WithdrawRequest,
} from "./types";

export class WithdrawProvider extends TransferProvider {
  public async withdraw(args: WithdrawRequest): Promise<TransferResponse> {
    const search = queryString.stringify(args);
    const response = await fetch(`${this.transferServer}/withdraw?${search}`);
    return response.json();
  }

  public async fetchSupportedAssets() {
    const { withdraw } = await this.fetchInfo();
    return withdraw;
  }

  public async fetchFinalFee(args: Omit<FeeArgs, "operation">) {
    return super.fetchFinalFee({
      ...args,
      operation: "withdraw",
    });
  }

  public async fetchKycInBrowser({
    response,
    request,
    window: windowContext,
  }: {
    response: InteractiveKycNeeded;
    request: WithdrawRequest;
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
        const retryResponse = await this.withdraw(request);
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
