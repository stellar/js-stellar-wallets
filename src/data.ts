import { IToken } from "./types";

export function getTokenIdentifier(token: IToken): string {
  if (token.type === "native") {
    return "native";
  }

  return `${token.code}:${token.issuer.key}`;
}
