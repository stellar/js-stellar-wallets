import { getKycUrl } from "./getKycUrl";
import { InteractiveKycNeeded, KycPromptStatus } from "./types";

export const fetchKycInBrowser = ({
  response,
  window: windowContext,
}: {
  response: InteractiveKycNeeded;
  window: Window;
}): Promise<KycPromptStatus> => {
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
    windowContext.location.href = getKycUrl(response, "postMessage");
  });
};
