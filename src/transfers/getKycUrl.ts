import queryString from "query-string";
import { URL } from "url";

import {
  DepositRequest,
  InteractiveKycNeededResponse,
  WithdrawRequest,
} from "../types";

interface PostMessageArgs {
  response: InteractiveKycNeededResponse;
  callback_url: "postMessage";
}
interface CallbackUrlArgs {
  response: InteractiveKycNeededResponse;
  callback_url: string;
  request: DepositRequest | WithdrawRequest;
}
export type KycUrlArgs = PostMessageArgs | CallbackUrlArgs;

const isPostMessage = (args: KycUrlArgs): args is PostMessageArgs =>
  args.callback_url === "postMessage";

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
 * @param {KycUrlArgs} args An object with 3 properties
 * @param {DepositRequest | WithdrawRequest} args.request The original request
 * that needs KYC information.
 * @param {InteractiveKycNeededResponse} args.response The complete response.
 * @param {string} args.callback_url A url that the anchor should send
 * information to once KYC information has been received.
 * @returns {string} A URL to open so users can complete their KYC information.
 */
export function getKycUrl(args: KycUrlArgs) {
  if (isPostMessage(args)) {
    return `${args.response.url}&callback=postMessage`;
  } else {
    // If the callback arg is a URL, add the original request to it as a
    // querystring argument.
    const url = new URL(args.callback_url);
    const search = { ...queryString.parse(url.search) };
    search.request = encodeURIComponent(JSON.stringify(args.request));
    url.search = queryString.stringify(search);

    return `${args.response.url}&callback=${encodeURIComponent(
      url.toString(),
    )}`;
  }
}
