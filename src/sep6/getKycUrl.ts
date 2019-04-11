import { InteractiveKycNeeded } from "./types";

export function getKycUrl(response: InteractiveKycNeeded, callbackUrl: string) {
  return `${response.url}&callback=${callbackUrl}`;
}
