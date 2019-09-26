import sinon from "sinon";
import StellarSdk from "stellar-sdk";
import { DepositProvider } from "./DepositProvider";

import { TransactionStatus } from "../constants/transfers";
import { DepositInfo, Transaction } from "../types";

const originalSetTimeout = global.setTimeout;

function sleep(time: number) {
  return new Promise((resolve) => {
    originalSetTimeout(resolve, time);
  });
}

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

    const provider = new DepositProvider(
      "test",
      StellarSdk.Keypair.random().publicKey(),
    );

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

    const provider = new DepositProvider(
      "test",
      StellarSdk.Keypair.random().publicKey(),
    );

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

describe("watchTransaction", () => {
  let clock: sinon.SinonFakeTimers;
  let provider: DepositProvider;

  // suite-wide consts
  const transferServer = "https://www.stellar.org/transfers";
  const info: any = {
    deposit: {
      SMX: {
        enabled: true,
        fee_fixed: 0,
        fee_percent: 0,
        min_amount: 1500,
        max_amount: 1000000,
        fields: {
          email_address: {
            description: "your email address for transaction status updates",
            optional: true,
          },
          amount: { description: "amount in cents that you plan to deposit" },
          type: {
            description: "type of deposit to make",
            choices: ["SPEI", "cash"],
          },
        },
      },
    },
    withdraw: {
      SMX: {
        enabled: true,
        fee_fixed: 0,
        fee_percent: 0,
        min_amount: 0.1,
        max_amount: 1000000,
        types: {
          bank_account: {
            fields: { dest: { description: "your bank account number" } },
          },
        },
      },
    },
    fee: { enabled: false },
    transactions: { enabled: true },
    transaction: { enabled: true },
  };

  const pendingTransaction: Transaction = {
    kind: "deposit",
    id: "TEST",
    status: TransactionStatus.pending_anchor,
  };
  const successfulTransaction: Transaction = {
    kind: "deposit",
    id: "TEST",
    status: TransactionStatus.completed,
  };
  const failedTransaction: Transaction = {
    kind: "deposit",
    id: "TEST",
    status: TransactionStatus.error,
  };

  beforeEach(async () => {
    clock = sinon.useFakeTimers(0);
    // @ts-ignore
    fetch.resetMocks();

    // first, mock fetching info
    // @ts-ignore
    fetch.mockResponseOnce(JSON.stringify(info));

    provider = new DepositProvider(
      transferServer,
      StellarSdk.Keypair.random().publicKey(),
    );

    await provider.fetchSupportedAssets();
  });

  afterEach(() => {
    clock.restore();
  });

  test("One success", async (done) => {
    const onMessage = sinon.spy((transaction) => {
      done(`onMessage incorrectly called with ${JSON.stringify(transaction)}`);
    });
    const onSuccess = sinon.spy(() => {
      done();
    });
    const onError = sinon.spy((e) => {
      done(`onError incorrectly called with ${e.toString}`);
    });

    // queue up a success
    // @ts-ignore
    fetch.mockResponses([JSON.stringify(successfulTransaction)]);

    // start watching
    provider.watchTransaction({
      asset_code: "SMX",
      id: successfulTransaction.id,
      onMessage,
      onSuccess,
      onError,
      timeout: 10,
    });

    // nothing should run at first
    expect(onMessage.callCount).toBe(0);
    expect(onSuccess.callCount).toBe(0);
    expect(onError.callCount).toBe(0);

    // wait a second, then done will call back
    clock.next();
  });

  test("One pending message", async (done) => {
    const onMessage = sinon.spy(() => {
      done();
    });
    const onSuccess = sinon.spy((transaction) => {
      done(`onSuccess incorrectly called with ${JSON.stringify(transaction)}`);
    });
    const onError = sinon.spy((e) => {
      done(`onError incorrectly called with ${JSON.stringify(e)}`);
    });

    // queue up a success
    // @ts-ignore
    fetch.mockResponses([JSON.stringify(pendingTransaction)]);

    // start watching
    provider.watchTransaction({
      asset_code: "SMX",
      id: successfulTransaction.id,
      onMessage,
      onSuccess,
      onError,
      timeout: 10,
    });

    // nothing should run at first
    expect(onMessage.callCount).toBe(0);
    expect(onSuccess.callCount).toBe(0);
    expect(onError.callCount).toBe(0);

    // wait a second, then done will call back success
    clock.next();
  });

  test("One error", async (done) => {
    const onMessage = sinon.spy((transaction) => {
      done(`onMessage incorrectly called with ${JSON.stringify(transaction)}`);
    });
    const onSuccess = sinon.spy((transaction) => {
      done(`onSuccess incorrectly called with ${JSON.stringify(transaction)}`);
    });
    const onError = sinon.spy(() => {
      done();
    });

    // then, queue up a success
    // @ts-ignore
    fetch.mockResponses([JSON.stringify(failedTransaction)]);

    // start watching
    provider.watchTransaction({
      asset_code: "SMX",
      id: successfulTransaction.id,
      onMessage,
      onSuccess,
      onError,
      timeout: 10,
    });

    // nothing should run at first
    expect(onMessage.callCount).toBe(0);
    expect(onSuccess.callCount).toBe(0);
    expect(onError.callCount).toBe(0);

    // wait a second, then done will call back
    clock.next();
  });

  test("Several pending transactions", async (done) => {
    const onMessage = sinon.spy(() => {
      expect(onMessage.callCount).toBeLessThan(5);
    });
    const onSuccess = sinon.spy((transaction) => {
      done(`onSuccess incorrectly called with ${JSON.stringify(transaction)}`);
    });
    const onError = sinon.spy((transaction) => {
      done(`onError incorrectly called with ${JSON.stringify(transaction)}`);
    });

    // queue up a success
    // @ts-ignore
    fetch.mockResponses(
      [JSON.stringify(pendingTransaction), { status: 200 }],
      [JSON.stringify(pendingTransaction), { status: 200 }],
      [JSON.stringify(pendingTransaction), { status: 200 }],
      [JSON.stringify(pendingTransaction), { status: 200 }],
    );

    // start watching
    provider.watchTransaction({
      asset_code: "SMX",
      id: successfulTransaction.id,
      onMessage,
      onSuccess,
      onError,
      timeout: 10,
    });

    // nothing should run at first
    expect(onMessage.callCount).toBe(0);
    expect(onSuccess.callCount).toBe(0);
    expect(onError.callCount).toBe(0);

    // wait a second, then done will call back success

    clock.next();
    await sleep(10);

    clock.next();
    await sleep(10);

    clock.next();
    await sleep(10);

    clock.next();
    await sleep(10);

    done();
  });

  test("One pending, one success, no more after that", async () => {
    const onMessage = sinon.spy(() => {
      expect(onMessage.callCount).toBeLessThan(2);
    });
    const onSuccess = sinon.spy(() => {
      expect(onMessage.callCount).toBeLessThan(2);
    });
    const onError = sinon.spy((transaction) => {
      expect(transaction).toBeUndefined();
    });

    // queue up a success
    // @ts-ignore
    fetch.mockResponses(
      [JSON.stringify(pendingTransaction), { status: 200 }],
      [JSON.stringify(successfulTransaction), { status: 200 }],
      [JSON.stringify(successfulTransaction), { status: 200 }],
      [JSON.stringify(successfulTransaction), { status: 200 }],
    );

    // start watching
    provider.watchTransaction({
      asset_code: "SMX",
      id: successfulTransaction.id,
      onMessage,
      onSuccess,
      onError,
      timeout: 10,
    });

    // nothing should run at first
    expect(onMessage.callCount).toBe(0);
    expect(onSuccess.callCount).toBe(0);
    expect(onError.callCount).toBe(0);

    clock.next();
    await sleep(10);

    // wait a second, then the pending should resolve
    expect(onMessage.callCount).toBe(1);
    expect(onSuccess.callCount).toBe(0);
    expect(onError.callCount).toBe(0);

    clock.next();
    await sleep(10);

    // the second time, a success should happen
    expect(onMessage.callCount).toBe(1);
    expect(onSuccess.callCount).toBe(1);
    expect(onError.callCount).toBe(0);

    clock.next();
    await sleep(10);

    // the third time, nothing should change or run again
    expect(onMessage.callCount).toBe(1);
    expect(onSuccess.callCount).toBe(1);
    expect(onError.callCount).toBe(0);
  });

  test("One pending, one error, no more after that", async () => {
    const onMessage = sinon.spy(() => {
      expect(onMessage.callCount).toBeLessThan(2);
    });
    const onSuccess = sinon.spy((transaction) => {
      expect(transaction).toBeUndefined();
    });
    const onError = sinon.spy(() => {
      expect(onError.callCount).toBeLessThan(2);
    });

    // queue up a success
    // @ts-ignore
    fetch.mockResponses(
      [JSON.stringify(pendingTransaction), { status: 200 }],
      [JSON.stringify(failedTransaction), { status: 200 }],
      [JSON.stringify(failedTransaction), { status: 200 }],
      [JSON.stringify(failedTransaction), { status: 200 }],
    );

    // start watching
    provider.watchTransaction({
      asset_code: "SMX",
      id: successfulTransaction.id,
      onMessage,
      onSuccess,
      onError,
      timeout: 10,
    });

    // nothing should run at first
    expect(onMessage.callCount).toBe(0);
    expect(onSuccess.callCount).toBe(0);
    expect(onError.callCount).toBe(0);

    clock.next();
    await sleep(10);

    // wait a second, then the pending should resolve
    expect(onMessage.callCount).toBe(1);
    expect(onSuccess.callCount).toBe(0);
    expect(onError.callCount).toBe(0);

    clock.next();
    await sleep(10);

    // the second time, a success should happen
    expect(onMessage.callCount).toBe(1);
    expect(onSuccess.callCount).toBe(0);
    expect(onError.callCount).toBe(1);

    clock.next();
    await sleep(10);

    // the third time, nothing should change or run again
    expect(onMessage.callCount).toBe(1);
    expect(onSuccess.callCount).toBe(0);
    expect(onError.callCount).toBe(1);
  });

  test("Two pending, one error, no more after that", async () => {
    const onMessage = sinon.spy(() => {
      expect(onMessage.callCount).toBeLessThan(3);
    });
    const onSuccess = sinon.spy((transaction) => {
      expect(transaction).toBeUndefined();
    });
    const onError = sinon.spy(() => {
      expect(onError.callCount).toBeLessThan(2);
    });

    // queue up a success
    // @ts-ignore
    fetch.mockResponses(
      [JSON.stringify(pendingTransaction), { status: 200 }],
      [JSON.stringify(pendingTransaction), { status: 200 }],
      [JSON.stringify(failedTransaction), { status: 200 }],
      [JSON.stringify(failedTransaction), { status: 200 }],
      [JSON.stringify(failedTransaction), { status: 200 }],
    );

    // start watching
    provider.watchTransaction({
      asset_code: "SMX",
      id: successfulTransaction.id,
      onMessage,
      onSuccess,
      onError,
      timeout: 10,
    });

    // nothing should run at first
    expect(onMessage.callCount).toBe(0);
    expect(onSuccess.callCount).toBe(0);
    expect(onError.callCount).toBe(0);

    clock.next();
    await sleep(10);

    // wait a second, then the pending should resolve
    expect(onMessage.callCount).toBe(1);
    expect(onSuccess.callCount).toBe(0);
    expect(onError.callCount).toBe(0);

    clock.next();
    await sleep(10);

    // the next time, another pending
    expect(onMessage.callCount).toBe(2);
    expect(onSuccess.callCount).toBe(0);
    expect(onError.callCount).toBe(0);

    clock.next();
    await sleep(10);

    // the next time, an error
    expect(onMessage.callCount).toBe(2);
    expect(onSuccess.callCount).toBe(0);
    expect(onError.callCount).toBe(1);

    clock.next();
    await sleep(10);

    // the next time, nothing should change or run again
    expect(onMessage.callCount).toBe(2);
    expect(onSuccess.callCount).toBe(0);
    expect(onError.callCount).toBe(1);
  });
});
