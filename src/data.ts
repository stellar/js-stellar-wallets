import { Token } from "./types";

export function getTokenIdentifier(token: Token): string {
  if (token.type === "native") {
    return "native";
  }

  return `${token.code}:${token.issuer.key}`;
}
