import { Token } from "./types";

export function getTokenIdentifier(token: Token) {
  return `${token.code}-${token.issuer.key}`;
}
