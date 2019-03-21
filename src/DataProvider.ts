import StellarSdk from "stellar-sdk";

import { Account } from "./types";

function isAccount(obj: any): obj is Account {
  return obj.publicKey !== undefined;
}

export class DataProvider {
  private serverUrl: string;
  private server: StellarSdk.Server;

  constructor(serverUrl: string) {
    this.serverUrl = serverUrl;
    this.server = new StellarSdk.Server(this.serverUrl);
  }

  public async getBalancesForAccount(accountOrKey: Account | string) {
    const accountKey = isAccount(accountOrKey) ? accountOrKey.publicKey : accountOrKey;
    const accountSummary = await this.server
      .accounts()
      .accountId(accountKey)
      .call();

    // tslint-disable-next-line
    console.log("account summary: ", accountSummary);
  }
}
