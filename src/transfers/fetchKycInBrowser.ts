import {
  DepositRequest,
  FetchKycInBrowserParams,
  KycPromptStatus,
  WithdrawRequest,
} from "../types";

import { getKycUrl } from "./getKycUrl";

export function fetchKycInBrowser(
  params: FetchKycInBrowserParams<DepositRequest | WithdrawRequest>,
): Promise<KycPromptStatus> {
  const { response, window: windowContext } = params;
  const { origin } = new URL(response.url);
  return new Promise((resolve, reject) => {
    const handleMessage = (e: MessageEvent) => {
      if (e.origin !== origin) {
        // React devtools appear to pump out tons and tons of these events,
        // this filters them out.
        return;
      }

      windowContext.removeEventListener("message", handleMessage);
      windowContext.close();
      if (e.data.status === "success") {
        resolve(e.data);
      } else {
        // TODO: clarify error sources
        reject(e.data);
      }
    };

    windowContext.addEventListener("message", handleMessage);
    windowContext.location.href = getKycUrl({
      response,
      callback_url: "postMessage",
    });
  });
}
