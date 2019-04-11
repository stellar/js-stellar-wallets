import { InteractiveKycNeeded } from "./types";

export const getKycUrl = (
  response: InteractiveKycNeeded,
  callbackUrl: string,
) => `${response.url}&callback=${callbackUrl}`;
