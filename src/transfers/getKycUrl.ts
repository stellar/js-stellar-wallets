import queryString from "query-string";

import {
  DepositRequest,
  InteractiveKycNeededResponse,
  WithdrawRequest,
} from "../types";

interface BaseParams {
  response: InteractiveKycNeededResponse;
}

interface PostMessageParams extends BaseParams {
  callback_url: "postMessage";
}
interface CallbackUrlParams extends BaseParams {
  callback_url: string;
  request: DepositRequest | WithdrawRequest;
}

export type KycUrlParams = BaseParams | PostMessageParams | CallbackUrlParams;

/**
 * `getKycUrl` takes in the original request object, a response object, and a
 * URL that the anchor should redirect to after KYC is complete.
 *
 * For ease of development, the original request is provided as a querystring
 * argument to the callback URL. This reduces how much state the application
 * must keep track of, since the deposit or withdrawal needs to be retried once
 * KYC is approved.
 *
 * ```js
 * if (depositResponse === TransferResponseType.interactiveKyc) {
 *   const kycRedirect = getKycUrl({
 *     result: withdrawResult,
 *     callback_url,
 *   });
 * }
 * ```
 *
 * On e.g. react native, the client will have to open a webview manually
 * and pass a callback URL that the app has "claimed." This is very
 * similar to e.g. OAuth flows.
 * https://www.oauth.com/oauth2-servers/redirect-uris/redirect-uris-native-apps/
 *
 * @param {KycUrlParams} params An object with 3 properties
 * @param {DepositRequest | WithdrawRequest} params.request The original request
 * that needs KYC information.
 * @param {InteractiveKycNeededResponse} params.response The complete response.
 * @param {string} params.callback_url A url that the anchor should send
 * information to once KYC information has been received.
 * @returns {string} A URL to open so users can complete their KYC information.
 */
export function getKycUrl(params: KycUrlParams) {
  // break apart and re-produce the URL
  const { origin, pathname, search, hash } = new URL(params.response.url);

  let callback = "";

  const { callback_url, request } = params as CallbackUrlParams;

  if (callback_url === "postMessage") {
    callback = `${search ? "&" : "?"}callback=postMessage`;
  } else if (callback_url && request) {
    // If the callback arg is a URL, add the original request to it as a
    // querystring argument.
    const url = new URL(callback_url);
    const newParams = { ...queryString.parse(url.search) };
    newParams.request = encodeURIComponent(JSON.stringify(request));
    url.search = queryString.stringify(newParams);
    callback = `${search ? "&" : "?"}callback=${encodeURIComponent(
      url.toString(),
    )}`;
  }

  return `${origin}${pathname}${search}${callback}${hash}`;
}
