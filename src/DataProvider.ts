import { Server } from "stellar-sdk";

import { makeDisplayableBalances } from "./makeDisplayableBalances";
import { Account, Balances } from "./types";

function isAccount(obj: any): obj is Account {
  return obj.publicKey !== undefined;
}

interface DataProviderParams {
  serverUrl: string;
  accountOrKey: Account | string;
}

interface BalanceWatcherParams {
  onMessage: (balances: Balances) => void;
  onError: (error: any) => void;
}

interface CallbacksObject {
  balances?: () => void;
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

  public async getBalances() {
    const accountSummary = await this.server
      .accounts()
      .accountId(this.accountKey)
      .call();

    return makeDisplayableBalances(accountSummary);
  }

  public watchBalances(params: BalanceWatcherParams) {
    const { onMessage, onError } = params;

    this.callbacks.balances = () => {
      this.getBalances()
        .then(onMessage)
        .catch(onError);
    };

    this._startEffectWatcher().catch((err) => {
      onError(err);
    });

    // if they exec this function, don't make the balance callback do anything
    return () => {
      delete this.callbacks.balances;
    };
  }

  private async _startEffectWatcher() {
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
