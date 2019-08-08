import { EncryptedKey, KeyMetadata } from "../types";

export function getKeyMetadata(encryptedKey: EncryptedKey): KeyMetadata {
  const { creationTime, modifiedTime, id } = encryptedKey;

  return {
    creationTime,
    modifiedTime,
    id,
  };
}
