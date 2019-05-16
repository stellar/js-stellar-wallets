/**
 * Constants
 */
import { EffectType } from "./constants/data";
import { KeyType } from "./constants/keys";

export const Constants = {
  EffectType,
  KeyType,
};

/**
 * Data
 */
import {
  getBalanceIdentifier,
  getTokenIdentifier,
  reframeEffect,
} from "./data";

export const Data = {
  getTokenIdentifier,
  getBalanceIdentifier,
  reframeEffect,
};

export { DataProvider } from "./data/DataProvider";

/**
 * Key Management
 */
export { KeyManager } from "./KeyManager";

export { KeyManagerPlugins } from "./KeyManagerPlugins";

export { testEncrypter, testKeyStore } from "./PluginTesting";

/**
 * Transfers
 */
import { DepositProvider, getKycUrl, WithdrawProvider } from "./transfers";

export const Transfers = {
  DepositProvider,
  WithdrawProvider,
  getKycUrl,
};
