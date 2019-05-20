/**
 * Constants
 */
import { EffectType } from "./constants/data";
import { KeyType } from "./constants/keys";
import { TransferResponseType } from "./constants/transfers";

export const Constants = {
  EffectType,
  KeyType,
  TransferResponseType,
};

/**
 * Data
 */
import {
  getBalanceIdentifier,
  getTokenIdentifier,
  reframeEffect,
} from "./data";

import { DataProvider } from "./data/DataProvider";

export const Data = {
  getTokenIdentifier,
  getBalanceIdentifier,
  reframeEffect,
  DataProvider,
};

/**
 * Key Management
 */
export { KeyManager } from "./KeyManager";

export { KeyManagerPlugins } from "./KeyManagerPlugins";

/**
 * Plugin Testing
 */

import { testEncrypter, testKeyStore } from "./PluginTesting";

export const PluginTesting = {
  testEncrypter,
  testKeyStore,
};

/**
 * Transfers
 */
import { DepositProvider, getKycUrl, WithdrawProvider } from "./transfers";

export const Transfers = {
  DepositProvider,
  WithdrawProvider,
  getKycUrl,
};
