import isEqual from "lodash/isEqual";
import queryString from "query-string";

import {
  DepositAssetInfo,
  DepositAssetInfoMap,
  Fee,
  FeeParams,
  Info,
  RawInfoResponse,
  SimpleFee,
  Transaction,
  TransactionParams,
  TransactionsParams,
  WatchAllTransactionsParams,
  WatcherResponse,
  WatchOneTransactionParams,
  WithdrawAssetInfo,
  WithdrawAssetInfoMap,
} from "../types";

import { TransactionStatus } from "../constants/transfers";

import { parseInfo } from "./parseInfo";

interface WatchRegistryAsset {
  [id: string]: boolean;
}

interface WatchOneTransactionRegistry {
  [asset_code: string]: WatchRegistryAsset;
}

interface WatchAllTransactionsRegistry {
  [asset_code: string]: boolean;
}

interface TransactionsRegistryAsset {
  [id: string]: Transaction;
}

interface TransactionsRegistry {
  [asset_code: string]: TransactionsRegistryAsset;
}

/**
 * TransferProvider is the base class for WithdrawProvider and DepositProvider.
 */
export abstract class TransferProvider {
  public transferServer: string;
  public operation: "deposit" | "withdraw";
  public account: string;
  public info?: Info;
  public authToken?: string;

  // This type monstrosity courtesy of https://stackoverflow.com/a/56239226
  protected _oneTransactionWatcher?: ReturnType<typeof setTimeout>;
  protected _allTransactionsWatcher?: ReturnType<typeof setTimeout>;

  protected _watchOneTransactionRegistry: WatchOneTransactionRegistry;
  protected _watchAllTransactionsRegistry: WatchAllTransactionsRegistry;
  protected _transactionsRegistry: TransactionsRegistry;
  protected _transactionsIgnoredRegistry: TransactionsRegistry;

  constructor(
    transferServer: string,
    account: string,
    operation: "deposit" | "withdraw",
  ) {
    if (!transferServer) {
      throw new Error("Required parameter `transferServer` missing!");
    }

    if (!account) {
      throw new Error("Required parameter `account` missing!");
    }

    if (!operation) {
      throw new Error("Required parameter `operation` missing!");
    }

    this.transferServer = transferServer;
    this.operation = operation;
    this.account = account;

    this._watchOneTransactionRegistry = {};
    this._watchAllTransactionsRegistry = {};
    this._transactionsRegistry = {};
    this._transactionsIgnoredRegistry = {};
  }

  protected async fetchInfo(): Promise<Info> {
    const response = await fetch(`${this.transferServer}/info`);
    const rawInfo = (await response.json()) as RawInfoResponse;
    const info = parseInfo(rawInfo);
    this.info = info;
    return info;
  }

  protected getHeaders(): Headers {
    return new Headers(
      this.authToken
        ? {
            Authorization: `Bearer ${this.authToken}`,
          }
        : {},
    );
  }

  /**
   * Set the bearer token fetched by KeyManager's fetchAuthToken function.
   * (setAuthToken and fetchAuthToken are in two different classes because
   * fetchAuthToken requires signing keys, which requires KeyManager's helpers.)
   */
  public setAuthToken(token: string) {
    this.authToken = token;
  }

  public abstract fetchSupportedAssets():
    | Promise<WithdrawAssetInfoMap>
    | Promise<DepositAssetInfoMap>;

  public abstract getAssetInfo(
    asset_code: string,
  ): WithdrawAssetInfo | DepositAssetInfo;

  /**
   * Fetch the list of transactions for a given account / asset code from the
   * transfer server.
   */
  public async fetchTransactions(
    params: TransactionsParams,
  ): Promise<Transaction[]> {
    const isAuthRequired = this.getAuthStatus(
      "fetchTransactions",
      params.asset_code,
    );

    let kind;

    if (!params.show_all_transactions) {
      kind =
        params.kind || this.operation === "deposit" ? "deposit" : "withdrawal";
    }

    const response = await fetch(
      `${this.transferServer}/transactions?${queryString.stringify({
        ...params,
        account: this.account,
        kind,
      })}`,
      {
        headers: isAuthRequired ? this.getHeaders() : undefined,
      },
    );

    const { transactions } = await response.json();

    return transactions;
  }

  /**
   * Fetch the information of a single transaction from the transfer server.
   */
  public async fetchTransaction(
    params: TransactionParams,
    isWatching: boolean,
  ): Promise<Transaction> {
    const { asset_code, id } = params;
    const isAuthRequired = this.getAuthStatus(
      isWatching ? "watchOneTransaction" : "fetchTransaction",
      asset_code,
    );

    const response = await fetch(
      `${this.transferServer}/transaction?${queryString.stringify({ id })}`,
      {
        headers: isAuthRequired ? this.getHeaders() : undefined,
      },
    );

    const transaction: Transaction = await response.json();

    return transaction;
  }

  /**
   * Watch all transactions returned from a transfer server. When new or
   * updated transactions come in, run an `onMessage` callback.
   *
   * On initial load, it'll return ALL pending transactions via onMessage.
   * Subsequent messages will be any one of these events:
   *  * Any new transaction appears
   *  * Any of the initial pending transactions change any state
   *
   * You may also provide an array of transaction ids, `watchlist`, and this
   * watcher will always react to transactions whose ids are in the watchlist.
   */
  public watchAllTransactions(
    params: WatchAllTransactionsParams,
  ): WatcherResponse {
    const {
      asset_code,
      onMessage,
      onError,
      watchlist = [],
      timeout = 5000,
      isRetry = false,
      ...otherParams
    } = params;

    // make an object map out of watchlist
    const watchlistMap: any = watchlist.reduce(
      (memo: any, id: string) => ({ ...memo, [id]: true }),
      {},
    );

    // if it's a first run, drop it in the registry
    if (!isRetry) {
      this._watchAllTransactionsRegistry = {
        ...this._watchAllTransactionsRegistry,
        [asset_code]: true,
      };
    }

    this.fetchTransactions({ asset_code, ...(otherParams || {}) })
      .then((transactions: Transaction[]) => {
        // make sure we're still watching
        if (!this._watchAllTransactionsRegistry[asset_code]) {
          return;
        }

        try {
          const newTransactions = transactions.filter(
            (transaction: Transaction) => {
              const isPending = transaction.status.indexOf("pending") === 0;
              const registeredTransaction = this._transactionsRegistry[
                asset_code
              ][transaction.id];

              // if this is the first watch, only keep the pending ones
              if (!isRetry) {
                // always show transactions on the watchlist
                if (watchlistMap[transaction.id]) {
                  return true;
                }

                // if we're not pending, then save this in an ignore reg
                if (!isPending) {
                  this._transactionsIgnoredRegistry[asset_code][
                    transaction.id
                  ] = transaction;
                }

                return isPending;
              }

              // if we've had the transaction before, only report updates
              if (registeredTransaction) {
                return !isEqual(registeredTransaction, transaction);
              }

              // if it's NOT a registered transaction, and it's not the first
              // roll, maybe it's a new trans that completed immediately
              // so register that!
              if (
                !registeredTransaction &&
                transaction.status === TransactionStatus.completed &&
                isRetry &&
                !this._transactionsIgnoredRegistry[asset_code][transaction.id]
              ) {
                return true;
              }

              // always use pending transactions
              if (isPending) {
                return true;
              }

              return false;
            },
          );

          newTransactions.forEach((transaction) => {
            this._transactionsRegistry[asset_code][
              transaction.id
            ] = transaction;
            onMessage(transaction);
          });
        } catch (e) {
          onError(e);
          return;
        }

        // call it again
        if (this._allTransactionsWatcher) {
          clearTimeout(this._allTransactionsWatcher);
        }
        this._allTransactionsWatcher = setTimeout(() => {
          this.watchAllTransactions({
            asset_code,
            onMessage,
            onError,
            timeout,
            isRetry: true,
          });
        }, timeout);
      })

      .catch((e) => {
        onError(e);
      });

    return {
      refresh: () => {
        // don't do that if we stopped watching
        if (!this._watchAllTransactionsRegistry[asset_code]) {
          return;
        }

        if (this._allTransactionsWatcher) {
          clearTimeout(this._allTransactionsWatcher);
        }
        this.watchAllTransactions({
          asset_code,
          onMessage,
          onError,
          timeout,
          isRetry: true,
        });
      },
      stop: () => {
        if (this._allTransactionsWatcher) {
          this._watchAllTransactionsRegistry[asset_code] = false;
          this._transactionsRegistry[asset_code] = {};
          this._transactionsIgnoredRegistry[asset_code] = {};
          clearTimeout(this._allTransactionsWatcher);
        }
      },
    };
  }

  /**
   * Watch a transaction until it stops pending. Takes three callbacks:
   * * onMessage - When the transaction comes back as pending.
   * * onSuccess - When the transaction comes back as completed.
   * * onError - When there's a runtime error, or the transaction is incomplete
   * / no_market / too_small / too_large / error.
   */
  public watchOneTransaction(
    params: WatchOneTransactionParams,
  ): WatcherResponse {
    const {
      asset_code,
      id,
      onMessage,
      onSuccess,
      onError,
      timeout = 5000,
      isRetry = false,
      ...otherParams
    } = params;
    // if it's a first blush, drop it in the registry
    if (!isRetry) {
      this._watchOneTransactionRegistry = {
        ...this._watchOneTransactionRegistry,
        [asset_code]: {
          ...(this._watchOneTransactionRegistry[asset_code] || {}),
          [id]: true,
        },
      };
    }

    // do this all asynchronously (since this func needs to return a cancel fun)
    this.fetchTransaction({ asset_code, id, ...(otherParams || {}) }, true)
      .then((transaction: Transaction) => {
        if (
          !(
            this._watchOneTransactionRegistry[asset_code] &&
            this._watchOneTransactionRegistry[asset_code][id]
          )
        ) {
          return;
        }

        // don't report on something that's been registered already
        const registeredTransaction = this._transactionsRegistry[asset_code][
          transaction.id
        ];

        if (
          registeredTransaction &&
          isEqual(registeredTransaction, transaction)
        ) {
          return;
        }

        this._transactionsRegistry[asset_code][transaction.id] = transaction;

        if (transaction.status.indexOf("pending") === 0) {
          if (this._oneTransactionWatcher) {
            clearTimeout(this._oneTransactionWatcher);
          }

          this._oneTransactionWatcher = setTimeout(() => {
            this.watchOneTransaction({
              asset_code,
              id,
              onMessage,
              onSuccess,
              onError,
              timeout,
              isRetry: true,
            });
          }, timeout);
          onMessage(transaction);
        } else if (transaction.status === TransactionStatus.completed) {
          onSuccess(transaction);
        } else {
          onError(transaction);
        }
      })
      .catch((e) => {
        onError(e);
      });

    return {
      refresh: () => {
        // don't do that if we stopped watching
        if (
          !(
            this._watchOneTransactionRegistry[asset_code] &&
            this._watchOneTransactionRegistry[asset_code][id]
          )
        ) {
          return;
        }

        if (this._oneTransactionWatcher) {
          clearTimeout(this._oneTransactionWatcher);
        }

        this.watchOneTransaction({
          asset_code,
          id,
          onMessage,
          onSuccess,
          onError,
          timeout,
          isRetry: true,
        });
      },
      stop: () => {
        if (this._oneTransactionWatcher) {
          this._watchOneTransactionRegistry[asset_code][id] = false;
          clearTimeout(this._oneTransactionWatcher);
        }
      },
    };
  }

  public async fetchFinalFee(params: FeeParams): Promise<number> {
    if (!this.info || !this.info[this.operation]) {
      throw new Error("Run fetchSupportedAssets before running fetchFinalFee!");
    }

    const assetInfo = this.info[this.operation][params.asset_code];

    if (!assetInfo) {
      throw new Error(
        `Can't get fee for an unsupported asset, '${params.asset_code}`,
      );
    }

    const { fee } = assetInfo;
    switch (fee.type) {
      case "none":
        return 0;
      case "simple":
        const simpleFee = fee as SimpleFee;
        return (
          ((simpleFee.percent || 0) / 100) * Number(params.amount) +
          (simpleFee.fixed || 0)
        );
      case "complex":
        const response = await fetch(
          `${this.transferServer}/fee?${queryString.stringify({
            ...params,
            ...fee,
            operation: this.operation,
          })}`,
        );
        const { fee: feeResponse } = await response.json();
        return feeResponse as number;

      default:
        throw new Error(
          `Invalid fee type found! Got '${
            (fee as Fee).type
          }' but expected one of 'none', 'simple', 'complex'`,
        );
    }
  }

  /**
   * Return whether or not auth is required on a token. Throw an error if no
   * asset_code or account was provided, or supported assets weren't fetched,
   * or the asset isn't supported by the transfer server.
   */
  protected getAuthStatus(functionName: string, asset_code: string): boolean {
    if (!asset_code) {
      throw new Error("Required parameter `asset_code` not provided!");
    }

    if (!this.info || !this.info[this.operation]) {
      throw new Error(
        `Run fetchSupportedAssets before running ${functionName}!`,
      );
    }

    const assetInfo = this.info[this.operation][asset_code];

    if (!assetInfo) {
      throw new Error(
        `Asset ${asset_code} is not supported by ${this.transferServer}`,
      );
    }

    const isAuthRequired = !!assetInfo.authentication_required;

    // if the asset requires authentication, require an auth_token
    if (isAuthRequired && !this.authToken) {
      throw new Error(
        `
        Asset ${asset_code} requires authentication. Run KeyManager's 
        fetchAuthToken function, then run setAuthToken to set it.
        `,
      );
    }

    return isAuthRequired;
  }
}
