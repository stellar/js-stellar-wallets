import queryString from "query-string";

import {
  DepositRequest,
  FeeArgs,
  InteractiveKycNeededResponse,
  TransferResponse,
} from "../types";
import { OmitProperties } from "../util";

import { fetchKycInBrowser } from "./fetchKycInBrowser";
import { TransferProvider } from "./TransferProvider";

/**
 * DepositProvider provides methods to interact with a transfer server. At a
 * high level, you'll need to:
 * - Fetch the supported assets.
 * - Collect information from the user.
 * - Confirm the deposit/show them how much fee they'll pay.
 * - Start the deposit.
 *  - If KYC is needed, you'll have to do some additional logic.
 *
 * ```js
 * const depositProvider = new DepositProvider(transferServerUrl);
 * const asset = await depositProvider.fetchSupportedAssets();
 *
 * // user provides information, picks asset
 *
 * const fee = await depositProvider.fetchFinalFee({
 *   assetCode,
 *   amount,
 *   type,
 * });
 *
 * // show fee to user, confirm amount and destination
 *
 * const depositResult = await depositProvider.deposit({
 *   assetCode,
 *   account,
 *   // more optional properties
 * });
 *
 * // We've gotten a result, but it might be one of several types.
 * switch (depositResult.type) {
 *   case TransferResponseType.ok:
 *     // The deposit request succeeded, so show it to the user.
 *     MyApp.showMessage(depositResult);
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
export class DepositProvider extends TransferProvider {
  public async deposit(args: DepositRequest): Promise<TransferResponse> {
    const search = queryString.stringify({
      asset_code: args.assetCode,
      account: args.account,
      memo: args.memo,
      email_address: args.emailAddress,
      type: args.type,
    });
    const response = await fetch(`${this.transferServer}/deposit?${search}`);
    return response.json();
  }

  public async fetchSupportedAssets() {
    const { deposit } = await this.fetchInfo();
    return deposit;
  }

  public async fetchFinalFee(args: OmitProperties<FeeArgs, "operation">) {
    return super.fetchFinalFee({
      ...args,
      operation: "deposit",
    });
  }

  /**
   * `fetchKycInBrowser` expects the original request parameters, the response
   * object from `depositProvider.deposit()`, and a window instance.
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
   * if (depositResponse === TransferResponseType.interactiveKyc) {
   *   // To avoid popup blockers, the new window has to be opened directly in
   *   // response to a user click event, so we need consumers to provide us a
   *   // window instance that they created previously. This could also be done
   *   // in an iframe or something.
   *   // This exact example would likely be blocked by popup blockers.
   *   const popup = window.open('');
   *
   *   const kycResult = await depositProvider.fetchKycInBrowser({
   *     response: depositResult,
   *     request: depositRequest,
   *     window: popup,
   *   });
   *
   *   // showUser(kycResult);
   * }
   * ```
   *
   * @param {object} options An object of all needed options
   * @param {DepositRequest} options.request The original request options.
   * @param {InteractiveKycNeededResponse} options.response The result of
   * starting the deposit.
   * @param {window} window A window object created with `window.open()`. This
   * helper will navigate to the correct page, so the window can be empty when
   * you pass it in.
   * @returns {Promise} A promise with the result of the KYC attempt. If it
   * succeeds, this will be the information needed to complete a deposit. If it
   * fails, it will contain information about the KYC failure from the anchor.
   */
  public async fetchKycInBrowser({
    response,
    request,
    window: windowContext,
  }: {
    response: InteractiveKycNeededResponse;
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
