import debounce from "lodash/debounce";
import { Keypair, Server, ServerApi, StrKey } from "stellar-sdk";

import {
  Account,
  AccountDetails,
  Collection,
  CollectionParams,
  FetchAccountError,
  Offer,
  Payment,
  Trade,
  WatcherParams,
} from "../types";

import { makeDisplayableBalances } from "./makeDisplayableBalances";
import { makeDisplayableOffers } from "./makeDisplayableOffers";
import { makeDisplayablePayments } from "./makeDisplayablePayments";
import { makeDisplayableTrades } from "./makeDisplayableTrades";

export interface DataProviderParams {
  serverUrl: string;
  accountOrKey: Account | string;
}

function isAccount(obj: any): obj is Account {
  return obj && obj.publicKey !== undefined;
}

interface CallbacksObject {
  accountDetails?: () => void;
  payments?: () => void;
}

interface ErrorHandlersObject {
  accountDetails?: (error: any) => void;
  payments?: (error: any) => void;
}

interface WatcherTimeoutsObject {
  [name: string]: ReturnType<typeof setTimeout>;
}

export class DataProvider {
  private accountKey: string;
  private serverUrl: string;
  private server: Server;
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
    this.server = new Server(this.serverUrl);
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
   * Return the server object, in case the consumer wants to call an
   * unsupported function.
   */
  public getServer(): Server {
    return this.server;
  }

  /**
   * Check if the current account is funded or not.
   */
  public async isAccountFunded(): Promise<boolean> {
    try {
      await this.fetchAccountDetails();
      return true;
    } catch (e) {
      return !e.isUnfunded;
    }
  }

  /**
   * Fetch outstanding offers.
   */
  public async fetchOpenOffers(
    params: CollectionParams = {},
  ): Promise<Collection<Offer>> {
    // first, fetch all offers
    const offers = await this.server
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
    const trades = await this.server
      .trades()
      .forAccount(this.accountKey)
      .limit(params.limit || 10)
      .order(params.order || "desc")
      .cursor(params.cursor || "")
      .call();

    return this._processTrades(trades);
  }

  /**
   * Fetch payments (also includes path payments account creation).
   */
  public async fetchPayments(
    params: CollectionParams = {},
  ): Promise<Collection<Payment>> {
    const payments = await this.server
      .payments()
      .forAccount(this.accountKey)
      .limit(params.limit || 10)
      .order(params.order || "desc")
      .cursor(params.cursor || "")
      .join("transactions")
      .call();

    return this._processPayments(payments);
  }

  /**
   * Fetch account details (balances, signers, etc.).
   */
  public async fetchAccountDetails(): Promise<AccountDetails> {
    try {
      const accountSummary = await this.server
        .accounts()
        .accountId(this.accountKey)
        .call();

      const balances = makeDisplayableBalances(accountSummary);

      return {
        id: accountSummary.id,
        subentryCount: accountSummary.subentry_count,
        inflationDestination: accountSummary.inflation_destination,
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
        }

        onError(err);
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
   * Fetch payments, then re-fetch whenever the details update.
   * Returns a function you can execute to stop the watcher.
   */
  public watchPayments(params: WatcherParams<Payment>): () => void {
    const { onMessage, onError } = params;

    let getNextPayments: () => Promise<Collection<Payment>>;

    this.fetchPayments()

      // if the account is funded, watch for effects.
      .then((res) => {
        // for the first page load, "prev" is the people we want to get next!
        getNextPayments = res.prev;

        // onMessage each payment separately
        res.records.forEach(onMessage);

        this.callbacks.payments = debounce(() => {
          getNextPayments()
            .then((nextRes) => {
              // afterwards, "next" will be the next person!
              getNextPayments = nextRes.next;

              // get new things
              if (nextRes.records.length) {
                nextRes.records.forEach(onMessage);
              }
            })
            .catch(onError);
        }, 2000);
        this.errorHandlers.payments = onError;

        this._startEffectWatcher().catch((err) => {
          onError(err);
        });
      })

      // otherwise, if it's a 404, try again in a bit.
      .catch((err) => {
        if (err.isUnfunded) {
          this._watcherTimeouts.watchPayments = setTimeout(() => {
            this.watchPayments(params);
          }, 2000);
        }

        onError(err);
      });

    // if they exec this function, don't make the balance callback do anything
    return () => {
      if (this._watcherTimeouts.watchPayments) {
        clearTimeout(this._watcherTimeouts.watchPayments);
      }

      delete this.callbacks.accountDetails;
      delete this.errorHandlers.accountDetails;
    };
  }

  /**
   * Given a destination key, return a transaction that removes all trustlines
   * and offers on the tracked account and merges the account into a given one.
   *
   * @throws Throws if the account has balances.
   * @throws Throws if the destination account is invalid.
   */
  public async getStripAndMergeAccountTransaction(destinationKey: string) {
    // throw if the destination is invalid
    if (!StrKey.isValidEd25519PublicKey(destinationKey)) {
      throw new Error("The destination is not a valid Stellar address.");
    }

    let account: AccountDetails;

    // fetch the current account
    try {
      account = await this.fetchAccountDetails();
    } catch (e) {
      throw new Error(`Couldn't fetch account details, error: ${e.toString()}`);
    }

    // make sure all non-native balances are zero
    const hasNonZeroBalance = Object.keys(account.balances).reduce(
      (memo, identifier) => {
        const balance = account.balances[identifier];
        if (identifier !== "native" && balance.total.gt(0)) {
          return true;
        }
        return memo;
      },
      false,
    );

    if (hasNonZeroBalance) {
      throw new Error(
        "This account can't be closed until all non-XLM balances are 0.",
      );
    }

    // get ALL offers for the account
    // (we don't need trade details, so skip those)
    let offers: ServerApi.OfferRecord[] = [];
    try {
      let additionalOffers: ServerApi.OfferRecord[] | undefined;
      let cursor: string | undefined;
      let next: () => Promise<Collection<ServerApi.OfferRecord>> = () =>
        this.server
          .offers("accounts", this.accountKey)
          .limit(25)
          .order("desc")
          .cursor(cursor || "")
          .call();

      while (additionalOffers === undefined || additionalOffers.length) {
        const res = await next();
        additionalOffers = res.records;
        next = res.next;
        offers = [...offers, ...additionalOffers];
        console.log("Open offers list: ", openOffers);
      }
    } catch (e) {
      throw new Error(`Couldn't fetch open offers, error: ${e.toString()}`);
    }

    let operations;
  }

  private async _processOpenOffers(
    offers: ServerApi.CollectionPage<ServerApi.OfferRecord>,
  ): Promise<Collection<Offer>> {
    // find all offerids and check for trades of each
    const tradeRequests: Array<
      Promise<ServerApi.CollectionPage<ServerApi.TradeRecord>>
    > = offers.records.map(({ id }: { id: string }) =>
      this.server
        .trades()
        .forOffer(id)
        .call(),
    );

    const tradeResponses = await Promise.all(tradeRequests);

    return {
      next: () => offers.next().then((res) => this._processOpenOffers(res)),
      prev: () => offers.prev().then((res) => this._processOpenOffers(res)),
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
      next: () => trades.next().then((res) => this._processTrades(res)),
      prev: () => trades.prev().then((res) => this._processTrades(res)),
      records: makeDisplayableTrades(
        { publicKey: this.accountKey },
        trades.records,
      ),
    };
  }

  private async _processPayments(
    payments: ServerApi.CollectionPage<
      | ServerApi.PaymentOperationRecord
      | ServerApi.CreateAccountOperationRecord
      | ServerApi.PathPaymentOperationRecord
    >,
  ): Promise<Collection<Payment>> {
    return {
      next: () => payments.next().then((res) => this._processPayments(res)),
      prev: () => payments.prev().then((res) => this._processPayments(res)),
      records: await makeDisplayablePayments(
        { publicKey: this.accountKey },
        payments.records,
      ),
    };
  }

  private async _startEffectWatcher(): Promise<{}> {
    if (this.effectStreamEnder) {
      return Promise.resolve({});
    }

    // get the latest cursor
    const recentEffect = await this.server
      .effects()
      .forAccount(this.accountKey)
      .limit(1)
      .order("desc")
      .call();

    const cursor: string = recentEffect.records[0].paging_token;

    this.effectStreamEnder = this.server
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
