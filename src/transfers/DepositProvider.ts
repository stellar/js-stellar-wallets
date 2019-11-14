import queryString from "query-string";

import {
  DepositAssetInfoMap,
  DepositRequest,
  FetchKycInBrowserParams,
  TransferError,
  TransferResponse,
} from "../types";

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
 * const depositProvider = new DepositProvider(transferServerUrl, account);
 * const asset = await depositProvider.fetchSupportedAssets();
 *
 * // user provides information, picks asset
 *
 * const fee = await depositProvider.fetchFinalFee({
 *   asset_code,
 *   amount,
 *   type,
 * });
 *
 * // show fee to user, confirm amount and destination
 *
 * const depositResult = await depositProvider.startDeposit({
 *   asset_code,
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
  constructor(transferServer: string, account: string) {
    super(transferServer, account, "deposit");
  }

  /**
   * Start a deposit request.
   *
   * Note that all arguments must be in snake_case (which is what transfer
   * servers expect)!
   */
  public async startDeposit(params: DepositRequest): Promise<TransferResponse> {
    const isAuthRequired = this.getAuthStatus("deposit", params.asset_code);
    const search = queryString.stringify({ ...params, account: this.account });

    const response = await fetch(`${this.transferServer}/deposit?${search}`, {
      headers: isAuthRequired ? this.getHeaders() : undefined,
    });
    const json = (await response.json()) as TransferResponse;

    if (json.error) {
      const error: TransferError = new Error(
        typeof json.error === "string"
          ? json.error
          : JSON.stringify(json.error),
      );
      error.originalResponse = json;
      throw error;
    }

    return json;
  }

  /**
   * Fetch the assets that the deposit provider supports, along with details
   * about depositing that asset.
   */
  public async fetchSupportedAssets(): Promise<DepositAssetInfoMap> {
    const { deposit } = await this.fetchInfo();

    // seed internal registry objects with supported assets
    Object.keys(deposit).forEach((code) => {
      this._watchOneTransactionRegistry[code] =
        this._watchOneTransactionRegistry[code] || {};
      this._watchAllTransactionsRegistry[code] = false;
      this._transactionsRegistry[code] = this._transactionsRegistry[code] || {};
      this._transactionsIgnoredRegistry[code] =
        this._transactionsIgnoredRegistry[code] || {};
    });

    return deposit;
  }

  /**
   * `fetchKycInBrowser` expects the original request parameters, the response
   * object from `depositProvider.startDeposit()`, and a window instance.
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
  public async fetchKycInBrowser(
    params: FetchKycInBrowserParams<DepositRequest>,
  ) {
    const { response, request, window: windowContext } = params;
    const kycResult = await fetchKycInBrowser({
      response,
      request,
      window: windowContext,
    });
    switch (kycResult.status) {
      case "denied":
        return Promise.reject(kycResult);
      case "pending":
        return Promise.reject(kycResult);
      case "success": {
        const retryResponse = await this.startDeposit(request);
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
