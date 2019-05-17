import { EncryptedKey, KeyMetadata } from "../types";

export function getKeyMetadata({
  encryptedKey,
  creationTime,
  modifiedTime,
}: {
  encryptedKey: EncryptedKey;
  creationTime: number;
  modifiedTime: number;
}): KeyMetadata {
  const { encryptedPrivateKey, salt, ...keyWithoutDetails } = encryptedKey;
  return {
    ...keyWithoutDetails,
    creationTime,
    modifiedTime,
  };
}
