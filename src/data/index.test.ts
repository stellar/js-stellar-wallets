import { Asset } from "stellar-sdk";
import {
  getBalanceIdentifier,
  getStellarSdkAsset,
  getTokenIdentifier,
} from "./";

describe("getTokenIdentifier", () => {
  test("native element", () => {
    expect(getTokenIdentifier({ type: "native", code: "XLM" })).toEqual(
      "native",
    );
  });
  test("non-native element", () => {
    expect(
      getTokenIdentifier({
        code: "BAT",
        type: "credit_alphanum4",
        issuer: {
          key: "GBDEVU63Y6NTHJQQZIKVTC23NWLQVP3WJ2RI2OTSJTNYOIGICST6DUXR",
        },
      }),
    ).toEqual("BAT:GBDEVU63Y6NTHJQQZIKVTC23NWLQVP3WJ2RI2OTSJTNYOIGICST6DUXR");
  });
});

describe("getBalanceIdentifier", () => {
  test("native balance", () => {
    expect(
      getBalanceIdentifier({
        asset_type: "native",
        balance: "100",
        buying_liabilities: "foo",
        selling_liabilities: "bar",
      }),
    ).toEqual("native");
  });
  test("non-native balance", () => {
    expect(
      getBalanceIdentifier({
        asset_code: "BAT",
        asset_issuer:
          "GBDEVU63Y6NTHJQQZIKVTC23NWLQVP3WJ2RI2OTSJTNYOIGICST6DUXR",
        asset_type: "credit_alphanum4",
        balance: "100",
        buying_liabilities: "foo",
        is_authorized: false,
        is_authorized_to_maintain_liabilities: false,
        is_clawback_enabled: false,
        last_modified_ledger: 1,
        limit: "foo",
        selling_liabilities: "bar",
      }),
    ).toEqual("BAT:GBDEVU63Y6NTHJQQZIKVTC23NWLQVP3WJ2RI2OTSJTNYOIGICST6DUXR");
  });
  test("liquidity pool share balance", () => {
    expect(
      getBalanceIdentifier({
        asset_type: "liquidity_pool_shares",
        balance: "100",
        is_authorized: false,
        is_authorized_to_maintain_liabilities: false,
        is_clawback_enabled: false,
        last_modified_ledger: 1,
        limit: "foo",
        liquidity_pool_id:
          "0466a6bbafdc293b87f2ea7615919244057242b21ebf46b38d64536e8d2ac3c0",
      }),
    ).toEqual(
      "0466a6bbafdc293b87f2ea7615919244057242b21ebf46b38d64536e8d2ac3c0:lp",
    );
  });
});

describe("getStellarSdkAsset", () => {
  test("native element", () => {
    expect(getStellarSdkAsset({ type: "native", code: "XLM" })).toEqual(
      Asset.native(),
    );
  });
  test("normal element", () => {
    expect(
      getStellarSdkAsset({
        code: "BAT",
        type: "credit_alphanum4",
        issuer: {
          key: "GBDEVU63Y6NTHJQQZIKVTC23NWLQVP3WJ2RI2OTSJTNYOIGICST6DUXR",
        },
      }),
    ).toEqual(
      new Asset(
        "BAT",
        "GBDEVU63Y6NTHJQQZIKVTC23NWLQVP3WJ2RI2OTSJTNYOIGICST6DUXR",
      ),
    );
  });
});
