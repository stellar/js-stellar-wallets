// @ts-ignore
import debounce from "lodash/debounce";
import { Server, StrKey } from "stellar-sdk";

import { Account, AccountDetails, Offers, Trades } from "../types";
import { makeDisplayableBalances } from "./makeDisplayableBalances";
import { makeDisplayableOffers } from "./makeDisplayableOffers";
import { makeDisplayableTrades } from "./makeDisplayableTrades";

export interface DataProviderParams {
  serverUrl: string;
  accountOrKey: Account | string;
}

export interface WatcherParams {
  onMessage: (accountDetails: AccountDetails) => void;
  onError: (error: any) => void;
}

export interface CollectionParams {
  limit?: number;
  order?: "desc" | "asc";
  cursor?: string;
}

function isAccount(obj: any): obj is Account {
  return obj.publicKey !== undefined;
}

interface CallbacksObject {
  accountDetails?: () => void;
}

export class DataProvider {
  private server: Server;
  private accountKey: string;

  private effectStreamEnder?: () => void;
  private callbacks: CallbacksObject;

  constructor(params: DataProviderParams) {
    this.server = new Server(params.serverUrl);
    this.accountKey = isAccount(params.accountOrKey)
      ? params.accountOrKey.publicKey
      : params.accountOrKey;
    this.callbacks = {};
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
   * Fetch outstanding offers.
   */
  public async fetchOpenOffers(params: CollectionParams = {}): Promise<Offers> {
    // first, fetch all offers
    const offers = await this.server
      .offers("accounts", this.accountKey)
      .limit(params.limit || 10)
      .order(params.order || "desc")
      .cursor(params.cursor || "")
      .call()
      .then((data) => data.records);

    // find all offerids and check for trades of each
    const tradeRequests = offers.map(({ id }) =>
      this.server
        .trades()
        .forOffer(id)
        .call()
        .then((data) => data.records),
    );
    const tradeResponses = await Promise.all(tradeRequests);

    // @ts-ignore
    return makeDisplayableOffers({ offers, tradeResponses });
  }

  /**
   * Fetch recent trades.
   */
  public async fetchTrades(params: CollectionParams = {}): Promise<Trades> {
    const trades = await this.server
      .trades()
      .forAccount(this.accountKey)
      .limit(params.limit || 10)
      .order(params.order || "desc")
      .cursor(params.cursor || "")
      .call()
      .then((data) => data.records);

    return makeDisplayableTrades(trades);
  }

  /**
   * Fetch account details (balances, signers, etc.).
   */
  public async fetchAccountDetails(): Promise<AccountDetails> {
    const accountSummary = await this.server
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
  }

  /**
   * Fetch account detqails, then re-fetch whenever the details update.
   * Returns a function you can execute to stop the watcher.
   */
  public watchAccountDetails(params: WatcherParams): () => void {
    const { onMessage, onError } = params;

    this.fetchAccountDetails()
      .then(onMessage)
      .catch(onError);

    this.callbacks.accountDetails = debounce(() => {
      this.fetchAccountDetails()
        .then(onMessage)
        .catch(onError);
    }, 2000);

    this._startEffectWatcher().catch((err) => {
      onError(err);
    });

    // if they exec this function, don't make the balance callback do anything
    return () => {
      delete this.callbacks.accountDetails;
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
      });

    return Promise.resolve({});
  }
}
