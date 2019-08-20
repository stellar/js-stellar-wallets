import sha1 from "js-sha1";
import StellarSdk from "stellar-sdk";

import { EncryptedKey, Key, KeyMetadata } from "../types";

import { KeyType } from "../constants/keys";

export function generatePlaintextKey(): Key {
  const account = StellarSdk.Keypair.random();
  const publicKey = account.publicKey();
  const privateKey = account.secret();

  return {
    id: sha1(`${privateKey}${publicKey}`),
    type: KeyType.plaintextKey,
    publicKey,
    privateKey,
  };
}

export function generateLedgerKey(): Key {
  const account = StellarSdk.Keypair.random();
  const publicKey = account.publicKey();

  return {
    id: sha1(`${publicKey}`),
    type: KeyType.ledger,
    publicKey,
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
    encryptedBlob: `${privateKey}password`,
  };
}

export function generateKeyMetadata(encrypterName: string): KeyMetadata {
  const { id } = generateEncryptedKey(encrypterName);

  return {
    id,
  };
}
