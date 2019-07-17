import { DepositProvider } from "./DepositProvider";

describe("fetchFinalFee", () => {
  test("AnchorUSD", async () => {
    const info = {
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

    expect(
      await provider.fetchFinalFee({
        supportedAssets: info,
        assetCode: info.USD.assetCode,
        amount: "15",
        type: "",
      }),
    ).toEqual(5.15);
  });

  test("EUR from Nucleo staging", async () => {
    const info = {
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

    expect(
      await provider.fetchFinalFee({
        supportedAssets: info,
        assetCode: info.EUR.assetCode,
        amount: 10,
        type: "",
      }),
    ).toEqual(0.5);
  });
});
