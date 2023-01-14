import debounce from "lodash/debounce";
import {
  Account as StellarAccount,
  Asset,
  Keypair,
  Operation,
  Server,
  ServerApi,
  StrKey,
  TransactionBuilder,
} from "stellar-sdk";

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
  WatcherResponse,
} from "../types";

import { getStellarSdkAsset } from "./index";

import { makeDisplayableBalances } from "./makeDisplayableBalances";
import { makeDisplayableOffers } from "./makeDisplayableOffers";
import { makeDisplayablePayments } from "./makeDisplayablePayments";
import { makeDisplayableTrades } from "./makeDisplayableTrades";

export interface DataProviderParams {
  serverUrl: string;
  accountOrKey: Account | string;
  networkPassphrase: string;

  // these are passed to `new Server`
  metadata?: {
    allowHttp?: boolean;
    appName?: string;
    appVersion?: string;
  };
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
  private networkPassphrase: string;
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

    if (!params.networkPassphrase) {
      throw new Error("No network passphrase provided.");
    }

    // make sure the account key is a real account
    try {
      Keypair.fromPublicKey(accountKey);
    } catch (e) {
      throw new Error(`The provided key was not valid: ${accountKey}`);
    }

    const metadata = params.metadata || {};

    this.callbacks = {};
    this.errorHandlers = {};
    this.effectStreamEnder = undefined;
    this.networkPassphrase = params.networkPassphrase;
    this.serverUrl = params.serverUrl;
    this.server = new Server(this.serverUrl, metadata);
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
    } catch (e: any) {
      if (e.isUnfunded === undefined) {
        return false;
      }
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
      .offers()
      .forAccount(this.accountKey)
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
      const sponsor = accountSummary.sponsor
        ? { sponsor: accountSummary.sponsor }
        : {};

      return {
        ...sponsor,
        id: accountSummary.id,
        subentryCount: accountSummary.subentry_count,
        sponsoredCount: accountSummary.num_sponsored,
        sponsoringCount: accountSummary.num_sponsoring,
        inflationDestination: accountSummary.inflation_destination,
        thresholds: accountSummary.thresholds,
        signers: accountSummary.signers,
        flags: accountSummary.flags,
        sequenceNumber: accountSummary.sequence,
        balances,
      };
    } catch (err: any) {
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
  ): WatcherResponse {
    const { onMessage, onError } = params;

    this.fetchAccountDetails()

      // if the account is funded, watch for effects.
      .then((res) => {
        onMessage(res);
        this.callbacks.accountDetails = debounce(() => {
          this.fetchAccountDetails().then(onMessage).catch(onError);
        }, 2000);
        this.errorHandlers.accountDetails = onError;

        this._startEffectWatcher().catch((err) => {
          onError(err);
        });
      })

      // otherwise, if it's a 404, try again in a bit.
      .catch((err: any) => {
        if (err.isUnfunded) {
          this._watcherTimeouts.watchAccountDetails = setTimeout(() => {
            this.watchAccountDetails(params);
          }, 2000);
        }

        onError(err);
      });

    return {
      refresh: () => {
        this.stopWatchAccountDetails();
        this.watchAccountDetails(params);
      },
      stop: () => {
        this.stopWatchAccountDetails();
      },
    };
  }

  /**
   * Fetch payments, then re-fetch whenever the details update.
   * Returns a function you can execute to stop the watcher.
   */
  public watchPayments(params: WatcherParams<Payment>): WatcherResponse {
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
      .catch((err: any) => {
        if (err.isUnfunded) {
          this._watcherTimeouts.watchPayments = setTimeout(() => {
            this.watchPayments(params);
          }, 2000);
        }

        onError(err);
      });

    return {
      refresh: () => {
        this.stopWatchPayments();
        this.watchPayments(params);
      },
      stop: () => {
        this.stopWatchPayments();
      },
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
    // make sure the destination is a funded account
    if (!StrKey.isValidEd25519PublicKey(destinationKey)) {
      throw new Error("The destination is not a valid Stellar address.");
    }

    try {
      const destinationProvider = new DataProvider({
        serverUrl: this.serverUrl,
        accountOrKey: destinationKey,
        networkPassphrase: this.networkPassphrase,
      });

      destinationProvider.fetchAccountDetails();
    } catch (e: any) {
      if (e.isUnfunded) {
        throw new Error("The destination account is not funded yet.");
      }

      throw new Error(
        `Couldn't fetch the destination account, error: ${e.toString()}`,
      );
    }

    let account: AccountDetails;

    // fetch the current account
    try {
      account = await this.fetchAccountDetails();
    } catch (e: any) {
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
      let next: () => Promise<Collection<ServerApi.OfferRecord>> = () =>
        this.server
          .offers()
          .forAccount(this.accountKey)
          .limit(25)
          .order("desc")
          .call();

      while (additionalOffers === undefined || additionalOffers.length) {
        const res = await next();
        additionalOffers = res.records;
        next = res.next;
        offers = [...offers, ...additionalOffers];
      }
    } catch (e: any) {
      if (e instanceof Error) {
        throw new Error(`Couldn't fetch open offers, error: ${e.stack}`);
      }
      throw new Error(`Couldn't fetch open offers, error: ${e.toString()}`);
    }

    const accountObject = new StellarAccount(
      this.accountKey,
      account.sequenceNumber,
    );

    let fee = "1000";

    try {
      const feeStats = await this.server.feeStats();
      fee = feeStats.max_fee.p70;
    } catch (e) {
      // do nothing
    }

    const transaction = new TransactionBuilder(accountObject, {
      fee,
      networkPassphrase: this.networkPassphrase,
      timebounds: await this.server.fetchTimebounds(10 * 60 * 1000),
    });

    // strip offers
    offers.forEach((offer) => {
      const { seller, selling, buying, id } = offer;

      let operation;

      // check if we're the seller
      if (seller === this.accountKey) {
        operation = Operation.manageSellOffer({
          selling:
            selling.asset_code && selling.asset_issuer
              ? new Asset(selling.asset_code, selling.asset_issuer)
              : Asset.native(),
          buying:
            buying.asset_code && buying.asset_issuer
              ? new Asset(buying.asset_code, buying.asset_issuer)
              : Asset.native(),
          amount: "0",
          price: "0",
          offerId: id,
        });
      } else {
        operation = Operation.manageBuyOffer({
          selling:
            selling.asset_code && selling.asset_issuer
              ? new Asset(selling.asset_code, selling.asset_issuer)
              : Asset.native(),
          buying:
            buying.asset_code && buying.asset_issuer
              ? new Asset(buying.asset_code, buying.asset_issuer)
              : Asset.native(),
          buyAmount: "0",
          price: "0",
          offerId: id,
        });
      }
      transaction.addOperation(operation);
    });

    // strip trustlines
    Object.keys(account.balances).forEach((identifier) => {
      if (identifier === "native") {
        return;
      }

      const balance = account.balances[identifier];

      transaction.addOperation(
        Operation.changeTrust({
          asset: getStellarSdkAsset(balance.token),
          limit: "0",
        }),
      );
    });

    transaction.addOperation(
      Operation.accountMerge({
        destination: destinationKey,
      }),
    );

    return transaction.build();
  }

  /**
   * Stop acount details watcher.
   */
  private stopWatchAccountDetails() {
    // if they exec this function, don't make the balance callback do
    // anything

    if (this._watcherTimeouts.watchAccountDetails) {
      clearTimeout(this._watcherTimeouts.watchAccountDetails);
    }

    if (this.effectStreamEnder) {
      this.effectStreamEnder();
      this.effectStreamEnder = undefined;
    }

    delete this.callbacks.accountDetails;
    delete this.errorHandlers.accountDetails;
  }

  /**
   * Stop payments watcher.
   */
  private stopWatchPayments() {
    // if they exec this function, don't make the balance callback do
    // anything

    if (this._watcherTimeouts.watchPayments) {
      clearTimeout(this._watcherTimeouts.watchPayments);
    }

    if (this.effectStreamEnder) {
      this.effectStreamEnder();
      this.effectStreamEnder = undefined;
    }

    delete this.callbacks.payments;
    delete this.errorHandlers.payments;
  }

  private async _processOpenOffers(
    offers: ServerApi.CollectionPage<ServerApi.OfferRecord>,
  ): Promise<Collection<Offer>> {
    // find all offerids and check for trades of each
    const tradeRequests: Array<
      Promise<ServerApi.CollectionPage<ServerApi.TradeRecord>>
    > = offers.records.map(({ id }: { id: number | string }) =>
      this.server.trades().forOffer(`${id}`).call(),
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

  // Account details and payments use the same stream watcher
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
