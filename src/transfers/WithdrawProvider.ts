import queryString from "query-string";

import {
  TransactionStatus,
  TransferResponseType,
} from "../constants/transfers";
import {
  AnchorUSDKycStatus,
  InteractiveKycNeededResponse,
  KycStatus,
  TransferError,
  TransferResponse,
  WithdrawAssetInfo,
  WithdrawAssetInfoMap,
  WithdrawRequest,
} from "../types";

import { fetchKycInBrowser } from "./fetchKycInBrowser";
import { getKycUrl } from "./getKycUrl";
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
 * const withdrawProvider = new WithdrawProvider(transferServerUrl, account);
 * const asset = await withdrawProvider.fetchSupportedAssets();
 *
 * // user provides information, picks asset
 *
 * const fee = await withdrawProvider.fetchFinalFee({
 *   asset_code,
 *   amount,
 *   type,
 * });
 *
 * // show fee to user, confirm amount and destination
 *
 * const withdrawResult = await withdrawProvider.startWithdraw({
 *   type
 *   asset_code,
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
  public response?: TransferResponse;
  public request?: WithdrawRequest;

  constructor(
    transferServer: string,
    account: string,
    language: string = "en",
  ) {
    super(transferServer, account, language, "withdraw");
  }

  /**
   * Start a withdraw request.
   *
   * Note that all arguments must be in snake_case (which is what transfer
   * servers expect)!
   */
  public async startWithdraw(
    params: WithdrawRequest,
    shouldUseNewEndpoints: boolean = false,
    headers: { [key: string]: string } = {},
  ): Promise<TransferResponse> {
    const request: WithdrawRequest & { account: string } = {
      ...params,
      account: this.account,
      lang: this.language,
    };
    const isAuthRequired = this.getAuthStatus("withdraw", params.asset_code);

    let response;
    let json;

    if (shouldUseNewEndpoints) {
      const body = new FormData();

      Object.keys(request).forEach((key: string) => {
        body.append(key, request[key]);
      });

      response = await fetch(
        `${this.transferServer}/transactions/withdraw/interactive`,
        {
          method: "POST",
          body,
          headers: isAuthRequired ? this.getHeaders(headers) : undefined,
        },
      );
    } else {
      const qs = queryString.stringify(request);
      response = await fetch(`${this.transferServer}/withdraw?${qs}`, {
        headers: isAuthRequired ? this.getHeaders(headers) : undefined,
      });
    }

    const isAnchorUSDSep6 =
      !shouldUseNewEndpoints && this.transferServer.includes("anchorusd.com");

    if (!response.ok && !isAnchorUSDSep6) {
      const responseText = await response.text();
      try {
        const { error } = JSON.parse(responseText);
        throw new Error(
          `Error starting withdrawal to ${this.transferServer}: error ${error}`,
        );
      } catch (e) {
        throw new Error(
          `Error starting withdrawal to ${this.transferServer}: error 
          code ${response.status}, status text: "${responseText}"`,
        );
      }
    }

    const text = await response.text();

    try {
      json = JSON.parse(text) as TransferResponse;
    } catch (e) {
      throw new Error(`Error parsing the deposit response as JSON: ${text}`);
    }

    if (json.error) {
      const error: TransferError = new Error(json.error);
      error.originalResponse = json;
      throw error;
    }

    // if this was an auth-required token, insert the JWT
    if (
      isAuthRequired &&
      json.type === TransferResponseType.interactive_customer_info_needed &&
      json.url &&
      json.url.indexOf("jwt") === -1
    ) {
      const { origin, pathname, search, hash } = new URL(json.url);

      json.url = `${origin}${pathname}${search}${search ? "&" : "?"}jwt=${
        this.authToken
      }${hash}`;
    }

    this.request = request;
    this.response = json;

    return json;
  }

  /**
   * Fetch the assets that the deposit provider supports, along with details
   * about depositing that asset.
   */
  public async fetchSupportedAssets(): Promise<WithdrawAssetInfoMap> {
    const { withdraw } = await this.fetchInfo();

    // seed internal registry objects with supported assets
    Object.keys(withdraw).forEach((code) => {
      this._watchOneTransactionRegistry[code] =
        this._watchOneTransactionRegistry[code] || {};
      this._watchAllTransactionsRegistry[code] = false;
      this._transactionsRegistry[code] = this._transactionsRegistry[code] || {};
      this._transactionsIgnoredRegistry[code] =
        this._transactionsIgnoredRegistry[code] || {};
    });

    return withdraw;
  }

  /**
   * Get one supported asset by code.
   */
  public getAssetInfo(asset_code: string): WithdrawAssetInfo {
    if (!this.info || !this.info[this.operation]) {
      throw new Error(`Run fetchSupportedAssets before running getAssetInfo!`);
    }

    if (!this.info[this.operation][asset_code]) {
      throw new Error(`Asset not supported: ${asset_code}`);
    }

    return (this.info[this.operation] as WithdrawAssetInfoMap)[asset_code];
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
   * it fails, it will contain information about the KYC failure from the
   * anchor.
   */
  public async fetchKycInBrowser(windowContext: Window): Promise<KycStatus> {
    if (!this.response || !this.request) {
      throw new Error(`Run startWithdraw before calling fetchKycInBrowser!`);
    }

    if (
      this.response.type !==
        TransferResponseType.interactive_customer_info_needed ||
      !this.response.url
    ) {
      throw new Error(`KYC not needed for this withdrawal!`);
    }

    const kycResult = await fetchKycInBrowser({
      response: this.response as InteractiveKycNeededResponse,
      request: this.request,
      window: windowContext,
    });

    // AnchorUSD has a specific response shape
    // It can be detected if the response has `type` === "customer_info_status"
    if (
      (kycResult as AnchorUSDKycStatus).type ===
      TransferResponseType.customer_info_status
    ) {
      switch (kycResult.status) {
        case "denied":
          return Promise.reject(kycResult);
        case "pending":
          return Promise.reject(kycResult);
        case "success":
          return Promise.resolve(kycResult);
        default:
          throw new Error(
            `Invalid KYC response received: '${kycResult.status}'.`,
          );
      }
    }

    // treat the other ones like standard, SEP-24 responses
    if (kycResult.status === TransactionStatus.completed) {
      return Promise.resolve(kycResult);
    }

    return Promise.reject(kycResult);
  }

  /**
   * Return the KYC url. Only run this after starting a transfer.
   */
  public getKycUrl(callback_url?: string) {
    if (!this.response || !this.request) {
      throw new Error(`Run startWithdraw before calling getKycUrl!`);
    }

    if (
      this.response.type !==
        TransferResponseType.interactive_customer_info_needed ||
      !this.response.url
    ) {
      throw new Error(`KYC not needed for this withdrawal!`);
    }

    return getKycUrl({
      response: this.response as InteractiveKycNeededResponse,
      request: this.request,
      callback_url,
    });
  }
}
