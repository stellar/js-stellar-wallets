import { DepositProvider } from "./DepositProvider";

import { DepositInfo } from "../types";

describe("makeSnakeCase", () => {
  test("changes camelcase things", () => {
    const provider = new DepositProvider("test");
    const req = {
      type: "type",
      assetCode: "assetCode",
      dest: "dest",
      destExtra: "destExtra",
      account: "account",
    };
    expect(provider.makeSnakeCase(req)).toEqual({
      type: "type",
      asset_code: "assetCode",
      dest: "dest",
      dest_extra: "destExtra",
      account: "account",
    });
  });
  test("doesn't change snakeCase stuff", () => {
    const provider = new DepositProvider("test");
    const req = {
      type: "type",
      asset_code: "assetCode",
      dest: "dest",
      dest_extra: "destExtra",
      account: "account",
    };
    expect(provider.makeSnakeCase(req)).toEqual(req);
  });
});

describe("fetchFinalFee", () => {
  test("AnchorUSD", async () => {
    const info: DepositInfo = {
      USD: {
        assetCode: "USD",
        fee: { type: "simple", fixed: 5, percent: 1 },
        minAmount: 15,
        fields: [
          {
            description: "your email address for transaction status updates",
            name: "email_address",
          },
          {
            description: "amount in USD that you plan to deposit",
            name: "amount",
          },
        ],
      },
    };

    const provider = new DepositProvider("test");

    // manually set info
    provider.info = { deposit: info, withdraw: {} };

    expect(
      await provider.fetchFinalFee({
        assetCode: info.USD.assetCode,
        amount: "15",
        type: "",
      }),
    ).toEqual(5.15);
  });

  test("EUR from Nucleo staging", async () => {
    const info: DepositInfo = {
      EUR: {
        assetCode: "EUR",
        fee: { type: "simple", percent: 0.5 },
        minAmount: 1,
        maxAmount: 1000000000,
        fields: [
          {
            description: "Type of deposit method for EUR",
            choices: ["SWIFT", "SEPA"],
            name: "type",
          },
        ],
      },
    };

    const provider = new DepositProvider("test");

    provider.info = { deposit: info, withdraw: {} };

    expect(
      await provider.fetchFinalFee({
        assetCode: info.EUR.assetCode,
        amount: "10",
        type: "",
      }),
    ).toEqual(0.05);
  });
});
