import { InteractiveKycNeededResponse } from "./types";

export function getKycUrl(
  response: InteractiveKycNeededResponse,
  callbackUrl: string,
) {
  return `${response.url}&callback=${callbackUrl}`;
}
