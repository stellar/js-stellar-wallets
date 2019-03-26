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

export class DataProvider {
  private server: Server;
  private accountKey: string;

  constructor(params: DataProviderParams) {
    this.server = new Server(params.serverUrl);
    this.accountKey = isAccount(params.accountOrKey)
      ? params.accountOrKey.publicKey
      : params.accountOrKey;
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
    let timer: any;

    timer = setInterval(() => {
      this.getBalances()
        .then(onMessage)
        .catch(onError);
    }, 3000) as any;

    return () => clearTimeout(timer);
  }
}
