import queryString from "query-string";
import { URL } from "url";

import {
  DepositRequest,
  InteractiveKycNeededResponse,
  WithdrawRequest,
} from "./types";

interface PostMessageArgs {
  response: InteractiveKycNeededResponse;
  callbackUrl: "postMessage";
}
interface CallbackUrlArgs {
  response: InteractiveKycNeededResponse;
  callbackUrl: string;
  request: DepositRequest | WithdrawRequest;
}
type KycUrlArgs = PostMessageArgs | CallbackUrlArgs;

const isPostMessage = (args: KycUrlArgs): args is PostMessageArgs =>
  args.callbackUrl === "postMessage";

export function getKycUrl(args: KycUrlArgs) {
  if (isPostMessage(args)) {
    return `${args.response.url}&callback=postMessage`;
  } else {
    // If the callback arg is a URL, add the original request to it as a
    // querystring argument.
    const url = new URL(args.callbackUrl);
    const search = { ...queryString.parse(url.search) };
    search.request = encodeURIComponent(JSON.stringify(args.request));
    url.search = queryString.stringify(search);

    return `${args.response.url}&callback=${encodeURIComponent(
      url.toString(),
    )}`;
  }
}
