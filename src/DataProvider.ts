import { Server } from "stellar-sdk";

import { makeDisplayableBalances } from "./makeDisplayableBalances";
import { Account } from "./types";

function isAccount(obj: any): obj is Account {
  return obj.publicKey !== undefined;
}

export class DataProvider {
  private server: Server;

  constructor(serverUrl: string) {
    this.server = new Server(serverUrl);
  }

  public async getBalancesForAccount(accountOrKey: Account | string) {
    const accountKey = isAccount(accountOrKey)
      ? accountOrKey.publicKey
      : accountOrKey;
    const accountSummary = await this.server
      .accounts()
      .accountId(accountKey)
      .call();

    return makeDisplayableBalances(accountSummary);
  }
}
