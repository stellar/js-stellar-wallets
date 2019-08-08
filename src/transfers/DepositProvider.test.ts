import { DepositProvider } from "./DepositProvider";

import { DepositInfo } from "../types";

describe("fetchFinalFee", () => {
  test("AnchorUSD", async () => {
    const info: DepositInfo = {
      USD: {
        asset_code: "USD",
        fee: { type: "simple", fixed: 5, percent: 1 },
        min_amount: 15,
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
        asset_code: info.USD.asset_code,
        amount: "15",
        type: "",
      }),
    ).toEqual(5.15);
  });

  test("EUR from Nucleo staging", async () => {
    const info: DepositInfo = {
      EUR: {
        asset_code: "EUR",
        fee: { type: "simple", percent: 0.5 },
        min_amount: 1,
        max_amount: 1000000000,
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
        asset_code: info.EUR.asset_code,
        amount: "10",
        type: "",
      }),
    ).toEqual(0.05);
  });
});
