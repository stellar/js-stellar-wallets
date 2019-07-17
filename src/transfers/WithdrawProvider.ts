import queryString from "query-string";

import {
  FeeArgs,
  InteractiveKycNeededResponse,
  TransferError,
  TransferResponse,
  WithdrawInfo,
  WithdrawRequest,
} from "../types";
import { OmitProperties } from "../util";

import { fetchKycInBrowser } from "./fetchKycInBrowser";
import { TransferProvider } from "./TransferProvider";

/**
 * WithdrawProvider provides methods to interact with a transfer server. At a
 * high level, you'll need to:
 * - Fetch the supported assets.
 * - Collect information from the user.
 * - Confirm the withdrawal/show them how much fee they'll pay.
 * - Start the withdrawal.
 *  - If KYC is needed, you'll have to do some additional logic.
 *
 * ```js
 * const withdrawProvider = new WithdrawProvider(transferServerUrl);
 * const asset = await withdrawProvider.fetchSupportedAssets();
 *
 * // user provides information, picks asset
 *
 * const fee = await withdrawProvider.fetchFinalFee({
 *   assetCode,
 *   amount,
 *   type,
 * });
 *
 * // show fee to user, confirm amount and destination
 *
 * const withdrawResult = await withdrawProvider.withdraw({
 *   type
 *   assetCode,
 *   dest,
 *   // more optional properties
 * });
 *
 * // We've gotten a result, but it might be one of several types.
 * switch (withdrawResult.type) {
 *   case TransferResponseType.ok:
 *     // The withdraw request succeeded, so submit a payment to the network.
 *     MyApp.makePayment(withdrawResult);
 *     break;
 *
 *   case TransferResponseType.interactiveKyc:
 *     // See `fetchKycInBrowser` for additional example code
 *   break;
 *
 *   case TransferResponseType.nonInteractiveKyc:
 *     // TODO: SEP-12 data submission
 *     break;
 *
 *   case TransferResponseType.kycStatus:
 *     // The KYC information was previously submitted, but hasn't been approved
 *     // yet. Should show the user the pending status and any supplemental
 *     // information returned
 *     break;
 *
 *   default:
 *     // There was an error.
 * }
 * ```
 *
 * There's a helper method for interactive KYC in the browser,
 * `fetchKycInBrowser`, and a helper function for constructing callback URLs for
 * serverside/native apps, `getKycUrl`.
 */
export class WithdrawProvider extends TransferProvider {
  /**
   * Make a withdraw request.
   *
   * Note that all arguments must be in camelCase, even though they're sent to
   * the server in snake_case!
   */
  public async withdraw(args: WithdrawRequest): Promise<TransferResponse> {
    if (!this.info || !this.info.withdraw) {
      throw new Error("Run fetchSupportedAssets before running withdraw!");
    }

    const search = queryString.stringify(this.makeSnakeCase(args));
    const isAuthRequired = this.info.withdraw[args.assetCode]
      .authenticationRequired;

    if (isAuthRequired && !this.bearerToken) {
      throw new Error(
        `${
          args.assetCode
        } requires authentication, please authorize with setBearerToken.`,
      );
    }

    const response = await fetch(`${this.transferServer}/withdraw?${search}`, {
      headers: isAuthRequired ? this.getHeaders() : undefined,
    });
    const json = (await response.json()) as TransferResponse;

    if (json.error) {
      const error: TransferError = new Error(json.error);
      error.originalResponse = json;
      throw error;
    }

    return json;
  }

  /**
   * Fetch the assets that the deposit provider supports, along with details
   * about depositing that asset.
   */
  public async fetchSupportedAssets(): Promise<WithdrawInfo> {
    const { withdraw } = await this.fetchInfo();
    return withdraw;
  }

  /**
   * Calculate the real fee for a withdrawal.
   */
  public async fetchFinalFee(args: OmitProperties<FeeArgs, "operation">) {
    return super.fetchFinalFee({
      ...args,
      operation: "withdraw",
    });
  }

  /**
   * `fetchKycInBrowser` expects the original request parameters, the response
   * object from `withdrawProvider.withdraw()`, and a window instance.
   *
   * Because pop-up blockers prevent new windows from being created, your app
   * will need to create one with `const popup = window.open()` and pass in the
   * result. More information on
   * [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/open).
   *
   * Server-side applications or native apps should use the `getKycUrl` helper
   * function.
   *
   * ```js
   * if (withdrawResponse === TransferResponseType.interactiveKyc) {
   *   // To avoid popup blockers, the new window has to be opened directly in
   *   // response to a user click event, so we need consumers to provide us a
   *   // window instance that they created previously. This could also be done
   *   // in an iframe or something.
   *   // This exact example would likely be blocked by popup blockers.
   *   const popup = window.open('');
   *
   *   const kycResult = await withdrawProvider.fetchKycInBrowser({
   *     response: withdrawResult,
   *     request: withdrawRequest,
   *     window: popup,
   *   });
   *
   *   // showUser(kycResult);
   * }
   * ```
   *
   * @param {object} options An object of all needed options
   * @param {WithdrawRequest} options.request The original request options.
   * @param {InteractiveKycNeededResponse} options.response The result of
   * starting the withdrawal.
   * @param {window} window A window object created with `window.open()`. This
   * helper will navigate to the correct page, so the window can be empty when
   * you pass it in.
   * @returns {Promise} A promise with the result of the KYC attempt. If it
   * succeeds, this will be the information needed to complete a withdrawal. If
   * it fails, it will contain information about the KYC failure from the anchor.
   */
  public async fetchKycInBrowser({
    response,
    request,
    window: windowContext,
  }: {
    response: InteractiveKycNeededResponse;
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
