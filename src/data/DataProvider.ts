// @ts-ignore
import debounce from "lodash/debounce";
import { Keypair, Server, ServerApi, StrKey } from "stellar-sdk";

import {
  Account,
  AccountDetails,
  Collection,
  CollectionParams,
  FetchAccountError,
  Offer,
  Trade,
  Transfer,
  WatcherParams,
} from "../types";

import { makeDisplayableBalances } from "./makeDisplayableBalances";
import { makeDisplayableOffers } from "./makeDisplayableOffers";
import { makeDisplayableTrades } from "./makeDisplayableTrades";
import { makeDisplayableTransfers } from "./makeDisplayableTransfers";

export interface DataProviderParams {
  serverUrl: string;
  accountOrKey: Account | string;
}

function isAccount(obj: any): obj is Account {
  return obj.publicKey !== undefined;
}

interface CallbacksObject {
  accountDetails?: () => void;
  transfers?: () => void;
}

interface ErrorHandlersObject {
  accountDetails?: (error: any) => void;
  transfers?: (error: any) => void;
}

interface WatcherTimeoutsObject {
  [name: string]: ReturnType<typeof setTimeout>;
}

export class DataProvider {
  private accountKey: string;
  private serverUrl: string;
  private _watcherTimeouts: WatcherTimeoutsObject;

  private effectStreamEnder?: () => void;
  private callbacks: CallbacksObject;
  private errorHandlers: ErrorHandlersObject;

  constructor(params: DataProviderParams) {
    const accountKey = isAccount(params.accountOrKey)
      ? params.accountOrKey.publicKey
      : params.accountOrKey;

    if (!accountKey) {
      throw new Error("No account key provided.");
    }

    if (!params.serverUrl) {
      throw new Error("No server url provided.");
    }

    // make sure the account key is a real account
    try {
      Keypair.fromPublicKey(accountKey);
    } catch (e) {
      throw new Error(`The provided key was not valid: ${accountKey}`);
    }

    this.callbacks = {};
    this.errorHandlers = {};
    this.serverUrl = params.serverUrl;
    this.accountKey = accountKey;
    this._watcherTimeouts = {};
  }

  /**
   * Return true if the key is valid. (It doesn't comment on whether the
   * key is a funded account.)
   */
  public isValidKey(): boolean {
    return StrKey.isValidEd25519PublicKey(this.accountKey);
  }

  /**
   * Return the current key.
   */
  public getAccountKey(): string {
    return this.accountKey;
  }

  /**
   * Check if the current account is funded or not.
   */
  public async isAccountFunded(): Promise<boolean> {
    try {
      await this.fetchAccountDetails();
      return true;
    } catch (e) {
      return !!e.isUnfunded;
    }
  }

  /**
   * Fetch outstanding offers.
   */
  public async fetchOpenOffers(
    params: CollectionParams = {},
  ): Promise<Collection<Offer>> {
    // first, fetch all offers
    const offers = await new Server(this.serverUrl)
      .offers("accounts", this.accountKey)
      .limit(params.limit || 10)
      .order(params.order || "desc")
      .cursor(params.cursor || "")
      .call();

    return this._processOpenOffers(offers);
  }

  /**
   * Fetch recent trades.
   */
  public async fetchTrades(
    params: CollectionParams = {},
  ): Promise<Collection<Trade>> {
    const trades = await new Server(this.serverUrl)
      .trades()
      .forAccount(this.accountKey)
      .limit(params.limit || 10)
      .order(params.order || "desc")
      .cursor(params.cursor || "")
      .call();

    return this._processTrades(trades);
  }

  /**
   * Fetch transfers (direct and path payments).
   */
  public async fetchTransfers(
    params: CollectionParams = {},
  ): Promise<Collection<Transfer>> {
    const transfers = await new Server(this.serverUrl)
      .payments()
      .forAccount(this.accountKey)
      .limit(params.limit || 10)
      .order(params.order || "desc")
      .cursor(params.cursor || "")
      .call();

    return this._processTransfers(transfers);
  }

  /**
   * Fetch account details (balances, signers, etc.).
   */
  public async fetchAccountDetails(): Promise<AccountDetails> {
    try {
      const accountSummary = await new Server(this.serverUrl)
        .accounts()
        .accountId(this.accountKey)
        .call();

      // @ts-ignore
      const balances = makeDisplayableBalances(accountSummary);

      return {
        id: accountSummary.id,
        subentryCount: accountSummary.subentry_count,
        inflationDestination: accountSummary.inflation_destination,
        lastModifiedLedger: accountSummary.last_modified_ledger,
        thresholds: accountSummary.thresholds,
        signers: accountSummary.signers,
        flags: accountSummary.flags,
        balances,
      };
    } catch (err) {
      err.isUnfunded = err.response && err.response.status === 404;
      throw err as FetchAccountError;
    }
  }

  /**
   * Fetch account details, then re-fetch whenever the details update.
   * If the account doesn't exist yet, it will re-check it every 2 seconds.
   * Returns a function you can execute to stop the watcher.
   */
  public watchAccountDetails(
    params: WatcherParams<AccountDetails>,
  ): () => void {
    const { onMessage, onError } = params;

    this.fetchAccountDetails()

      // if the account is funded, watch for effects.
      .then((res) => {
        onMessage(res);
        this.callbacks.accountDetails = debounce(() => {
          this.fetchAccountDetails()
            .then(onMessage)
            .catch(onError);
        }, 2000);
        this.errorHandlers.accountDetails = onError;

        this._startEffectWatcher().catch((err) => {
          onError(err);
        });
      })

      // otherwise, if it's a 404, try again in a bit.
      .catch((err) => {
        if (err.isUnfunded) {
          this._watcherTimeouts.watchAccountDetails = setTimeout(() => {
            this.watchAccountDetails(params);
          }, 2000);
        } else {
          onError(err);
        }
      });

    // if they exec this function, don't make the balance callback do anything
    return () => {
      if (this._watcherTimeouts.watchAccountDetails) {
        clearTimeout(this._watcherTimeouts.watchAccountDetails);
      }

      delete this.callbacks.accountDetails;
      delete this.errorHandlers.accountDetails;
    };
  }

  /**
   * Fetch transfers, then re-fetch whenever the details update.
   * Returns a function you can execute to stop the watcher.
   */
  public watchTransfers(params: WatcherParams<Transfer[]>): () => void {
    const { onMessage, onError } = params;

    let getNextTransfers: () => Promise<Collection<Transfer>>;

    this.fetchTransfers()

      // if the account is funded, watch for effects.
      .then((res) => {
        // reset the transfer cache
        getNextTransfers = res.next;
        onMessage(res.records);

        this.callbacks.transfers = debounce(() => {
          getNextTransfers()
            .then((nextRes) => {
              getNextTransfers = nextRes.next;

              // get new things
              if (nextRes.records.length) {
                onMessage(nextRes.records);
              }
            })
            .catch(onError);
        }, 2000);
        this.errorHandlers.transfers = onError;

        this._startEffectWatcher().catch((err) => {
          onError(err);
        });
      })

      // otherwise, if it's a 404, try again in a bit.
      .catch((err) => {
        if (err.isUnfunded) {
          this._watcherTimeouts.watchTransfers = setTimeout(() => {
            this.watchTransfers(params);
          }, 2000);
        } else {
          onError(err);
        }
      });

    // if they exec this function, don't make the balance callback do anything
    return () => {
      if (this._watcherTimeouts.watchTransfers) {
        clearTimeout(this._watcherTimeouts.watchTransfers);
      }

      delete this.callbacks.accountDetails;
      delete this.errorHandlers.accountDetails;
    };
  }

  private async _processOpenOffers(
    offers: ServerApi.CollectionPage<ServerApi.OfferRecord>,
  ): Promise<Collection<Offer>> {
    // find all offerids and check for trades of each
    const tradeRequests: Array<
      Promise<ServerApi.CollectionPage<ServerApi.TradeRecord>>
    > = offers.records.map(({ id }: { id: string }) =>
      new Server(this.serverUrl)
        .trades()
        .forOffer(id)
        .call(),
    );

    const tradeResponses = await Promise.all(tradeRequests);

    return {
      next: () => offers.next().then(this._processOpenOffers),
      prev: () => offers.prev().then(this._processOpenOffers),
      records: makeDisplayableOffers(
        { publicKey: this.accountKey },
        {
          offers: offers.records,
          tradeResponses: tradeResponses.map(
            (res: ServerApi.CollectionPage<ServerApi.TradeRecord>) =>
              res.records,
          ),
        },
      ),
    };
  }

  private async _processTrades(
    trades: ServerApi.CollectionPage<ServerApi.TradeRecord>,
  ): Promise<Collection<Trade>> {
    return {
      next: () => trades.next().then(this._processTrades),
      prev: () => trades.prev().then(this._processTrades),
      records: makeDisplayableTrades(
        { publicKey: this.accountKey },
        trades.records,
      ),
    };
  }

  private async _processTransfers(
    transfers: ServerApi.CollectionPage<
      | ServerApi.PaymentOperationRecord
      | ServerApi.CreateAccountOperationRecord
      | ServerApi.PathPaymentOperationRecord
    >,
  ): Promise<Collection<Transfer>> {
    return {
      next: () => transfers.next().then(this._processTransfers),
      prev: () => transfers.prev().then(this._processTransfers),
      records: makeDisplayableTransfers(
        { publicKey: this.accountKey },
        transfers.records,
      ),
    };
  }

  private async _startEffectWatcher(): Promise<{}> {
    if (this.effectStreamEnder) {
      return Promise.resolve({});
    }

    // get the latest cursor
    const recentEffect = await new Server(this.serverUrl)
      .effects()
      .forAccount(this.accountKey)
      .limit(1)
      .order("desc")
      .call();

    const cursor: string = recentEffect.records[0].paging_token;

    this.effectStreamEnder = new Server(this.serverUrl)
      .effects()
      .forAccount(this.accountKey)
      .cursor(cursor)
      .stream({
        onmessage: () => {
          // run all callbacks
          const callbacks = Object.values(this.callbacks).filter(
            (callback) => !!callback,
          );
          if (callbacks.length) {
            callbacks.forEach((callback) => {
              callback();
            });
          } else {
            if (this.effectStreamEnder) {
              this.effectStreamEnder();
            }
          }
        },
        onerror: (e) => {
          // run error handlers
          const errorHandlers = Object.values(this.errorHandlers).filter(
            (errorHandler) => !!errorHandler,
          );
          if (errorHandlers.length) {
            errorHandlers.forEach((errorHandler) => {
              errorHandler(e);
            });
          }
        },
      });

    return Promise.resolve({});
  }
}
