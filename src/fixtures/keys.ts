import StellarSdk from "stellar-sdk";

import { KeyType } from "../constants/keys";

export function generatePlaintextKey() {
  const account = StellarSdk.Keypair.random();
  return {
    type: KeyType.plaintextKey,
    publicKey: account.publicKey(),
    privateKey: account.secret(),
  };
}

export function generateLedgerKey() {
  const account = StellarSdk.Keypair.random();
  return {
    type: KeyType.ledger,
    publicKey: account.publicKey(),
    path: "44'/148'/0'",
  };
}

export function generateEncryptedKey() {
  const key = generatePlaintextKey();
  return {
    ...key,
    privateKey: undefined,
    encryptedPrivateKey: `${key.privateKey}password`,
  };
}

export function generateKeyMetadata(creationTime: number = 0) {
  const encryptedKey = generateEncryptedKey();
  return {
    encryptedKey,
    creationTime: creationTime || Math.floor(Date.now() / 1000),
    modifiedTime: Math.floor(Date.now() / 1000),
  };
}
