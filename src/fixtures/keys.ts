import StellarSdk from "stellar-sdk";

import { EncryptedKey, Key, KeyMetadata } from "../types";

import { KeyType } from "../constants/keys";

export function generatePlaintextKey(): Key {
  const account = StellarSdk.Keypair.random();
  return {
    type: KeyType.plaintextKey,
    publicKey: account.publicKey(),
    privateKey: account.secret(),
  };
}

export function generateLedgerKey(): Key {
  const account = StellarSdk.Keypair.random();
  return {
    type: KeyType.ledger,
    publicKey: account.publicKey(),
    privateKey: "",
    path: "44'/148'/0'",
  };
}

export function generateEncryptedKey(encrypterName: string): EncryptedKey {
  const { privateKey, ...key } = generatePlaintextKey();

  return {
    ...key,
    encrypterName,
    salt: "",
    encryptedPrivateKey: `${privateKey}password`,
  };
}

export function generateKeyMetadata(encrypterName: string): KeyMetadata {
  const { encryptedPrivateKey, salt, ...encryptedKey } = generateEncryptedKey(
    encrypterName,
  );
  return {
    ...encryptedKey,
    encrypterName,
    creationTime: Math.floor(Date.now() / 1000),
    modifiedTime: Math.floor(Date.now() / 1000),
  };
}
