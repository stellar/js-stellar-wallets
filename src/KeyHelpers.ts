import { EncryptedKey, KeyMetadata, LedgerKey, PlainTextKey } from "./types";

export function isLedgerKey(key: LedgerKey | PlainTextKey): key is LedgerKey {
  return (key as LedgerKey).path !== undefined;
}

export function getKeyMetadata({
  encryptedKey,
  creationTime,
  modifiedTime,
}: {
  encryptedKey: EncryptedKey;
  creationTime: number;
  modifiedTime: number;
}): KeyMetadata {
  return {
    encrypterName: encryptedKey.encrypterName,
    type: encryptedKey.key.type,
    publicKey: encryptedKey.key.publicKey,
    path: isLedgerKey(encryptedKey.key) ? encryptedKey.key.path : undefined,
    creationTime,
    modifiedTime,
  };
}
