import {
  EncryptedKey,
  EncryptedLedgerKey,
  EncryptedPlaintextKey,
  KeyMetadata,
  LedgerKey,
  PlaintextKey,
} from "./types";

export function isLedgerKey(
  key: LedgerKey | PlaintextKey | EncryptedLedgerKey | EncryptedPlaintextKey,
): key is LedgerKey | EncryptedLedgerKey {
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
    type: encryptedKey.type,
    publicKey: encryptedKey.publicKey,
    path: isLedgerKey(encryptedKey) ? encryptedKey.path : undefined,
    creationTime,
    modifiedTime,
  };
}
