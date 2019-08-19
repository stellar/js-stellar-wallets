import { EncryptedKey, KeyMetadata } from "../types";

export function getKeyMetadata(encryptedKey: EncryptedKey): KeyMetadata {
  const { id } = encryptedKey;

  return {
    id,
  };
}
