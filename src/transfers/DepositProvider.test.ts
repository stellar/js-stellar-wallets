import sinon from "sinon";
import StellarSdk from "stellar-sdk";
import { DepositProvider } from "./DepositProvider";

import { TransactionsResponse } from "../fixtures/TransactionsResponse";
import { SMXTransferInfo } from "../fixtures/TransferInfoResponse";

import { TransactionStatus } from "../constants/transfers";
import { DepositAssetInfoMap, Field, Transaction } from "../types";

const originalSetTimeout = global.setTimeout;

function sleep(time: number) {
  return new Promise((resolve) => {
    originalSetTimeout(resolve, time);
  });
}

describe("fetchFinalFee", () => {
  test("AnchorUSD", async () => {
    const info: DepositAssetInfoMap = {
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
    provider.authToken = "test";

    expect(
      await provider.fetchFinalFee({
        asset_code: info.USD.asset_code,
        amount: "15",
      }),
    ).toEqual(5.15);
  });

  test("EUR from Nucleo staging", async () => {
    const info: DepositAssetInfoMap = {
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
    provider.authToken = "test";

    expect(
      await provider.fetchFinalFee({
        asset_code: info.EUR.asset_code,
        amount: "10",
      }),
    ).toEqual(0.05);
  });
});

describe("watchOneTransaction", () => {
  let clock: sinon.SinonFakeTimers;
  let provider: DepositProvider;

  // suite-wide consts
  const transferServer = "https://www.stellar.org/transfers";

  const pendingTransaction = (
    eta: number,
    txStatus: TransactionStatus,
  ): { transaction: Transaction } => {
    return {
      transaction: {
        kind: "deposit",
        id: "TEST",
        status: txStatus,
        status_eta: eta,
      },
    };
  };
  const successfulTransaction = (
    eta: number,
    txStatus: TransactionStatus,
  ): { transaction: Transaction } => {
    return {
      transaction: {
        kind: "deposit",
        id: "TEST",
        status: txStatus,
        status_eta: eta,
      },
    };
  };
  const failedTransaction = (
    eta: number,
    txStatus: TransactionStatus,
  ): { transaction: Transaction } => {
    return {
      transaction: {
        kind: "deposit",
        id: "TEST",
        status: txStatus,
        status_eta: eta,
      },
    };
  };

  beforeEach(async () => {
    clock = sinon.useFakeTimers(0);
    // @ts-ignore
    fetch.resetMocks();

    // first, mock fetching info
    // @ts-ignore
    fetch.mockResponseOnce(JSON.stringify(SMXTransferInfo));

    provider = new DepositProvider(
      transferServer,
      StellarSdk.Keypair.random().publicKey(),
      "uk-UA",
    );
    provider.authToken = "test";

    await provider.fetchSupportedAssets();
  });

  afterEach(() => {
    clock.restore();
  });

  test("One completed success", async (done) => {
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
    fetch.mockResponses([
      JSON.stringify(successfulTransaction(0, TransactionStatus.completed)),
    ]);

    // start watching
    provider.watchOneTransaction({
      asset_code: "SMX",
      id: successfulTransaction(0, TransactionStatus.completed).transaction.id,
      onMessage,
      onSuccess,
      onError,
      timeout: 10,
      lang: "uk-UA",
    });

    // nothing should run at first
    expect(onMessage.callCount).toBe(0);
    expect(onSuccess.callCount).toBe(0);
    expect(onError.callCount).toBe(0);

    // wait a second, then done will call back
    clock.next();
  });

  test("One refunded success", async (done) => {
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
    fetch.mockResponses([
      JSON.stringify(successfulTransaction(0, TransactionStatus.refunded)),
    ]);

    // start watching
    provider.watchOneTransaction({
      asset_code: "SMX",
      id: successfulTransaction(0, TransactionStatus.refunded).transaction.id,
      onMessage,
      onSuccess,
      onError,
      timeout: 10,
      lang: "uk-UA",
    });

    // nothing should run at first
    expect(onMessage.callCount).toBe(0);
    expect(onSuccess.callCount).toBe(0);
    expect(onError.callCount).toBe(0);

    // wait a second, then done will call back onSuccess
    clock.next();
  });

  test("One pending_user_transfer_start message", async (done) => {
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
    fetch.mockResponses([
      JSON.stringify(
        pendingTransaction(0, TransactionStatus.pending_user_transfer_start),
      ),
    ]);

    // start watching
    provider.watchOneTransaction({
      asset_code: "SMX",
      id: successfulTransaction(
        0,
        TransactionStatus.pending_user_transfer_start,
      ).transaction.id,
      onMessage,
      onSuccess,
      onError,
      timeout: 10,
      lang: "uk-UA",
    });

    // nothing should run at first
    expect(onMessage.callCount).toBe(0);
    expect(onSuccess.callCount).toBe(0);
    expect(onError.callCount).toBe(0);

    // wait a second, then done will call back onMessage
    clock.next();
  });

  test("One pending_user_transfer_complete message", async (done) => {
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
    fetch.mockResponses([
      JSON.stringify(
        pendingTransaction(0, TransactionStatus.pending_user_transfer_complete),
      ),
    ]);

    // start watching
    provider.watchOneTransaction({
      asset_code: "SMX",
      id: successfulTransaction(
        0,
        TransactionStatus.pending_user_transfer_complete,
      ).transaction.id,
      onMessage,
      onSuccess,
      onError,
      timeout: 10,
      lang: "uk-UA",
    });

    // nothing should run at first
    expect(onMessage.callCount).toBe(0);
    expect(onSuccess.callCount).toBe(0);
    expect(onError.callCount).toBe(0);

    // wait a second, then done will call back onMessage
    clock.next();
  });

  test("One pending_anchor message", async (done) => {
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
    fetch.mockResponses([
      JSON.stringify(pendingTransaction(0, TransactionStatus.pending_anchor)),
    ]);

    // start watching
    provider.watchOneTransaction({
      asset_code: "SMX",
      id: successfulTransaction(0, TransactionStatus.pending_anchor).transaction
        .id,
      onMessage,
      onSuccess,
      onError,
      timeout: 10,
      lang: "uk-UA",
    });

    // nothing should run at first
    expect(onMessage.callCount).toBe(0);
    expect(onSuccess.callCount).toBe(0);
    expect(onError.callCount).toBe(0);

    // wait a second, then done will call back onMessage
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
    fetch.mockResponses([
      JSON.stringify(failedTransaction(0, TransactionStatus.error)),
    ]);

    // start watching
    provider.watchOneTransaction({
      asset_code: "SMX",
      id: successfulTransaction(0, TransactionStatus.error).transaction.id,
      onMessage,
      onSuccess,
      onError,
      timeout: 10,
      lang: "uk-UA",
    });

    // nothing should run at first
    expect(onMessage.callCount).toBe(0);
    expect(onSuccess.callCount).toBe(0);
    expect(onError.callCount).toBe(0);

    // wait a second, then done will call back onError
    clock.next();
  });

  test("One no_market", async (done) => {
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
    fetch.mockResponses([
      JSON.stringify(failedTransaction(0, TransactionStatus.no_market)),
    ]);

    // start watching
    provider.watchOneTransaction({
      asset_code: "SMX",
      id: successfulTransaction(0, TransactionStatus.no_market).transaction.id,
      onMessage,
      onSuccess,
      onError,
      timeout: 10,
      lang: "uk-UA",
    });

    // nothing should run at first
    expect(onMessage.callCount).toBe(0);
    expect(onSuccess.callCount).toBe(0);
    expect(onError.callCount).toBe(0);

    // wait a second, then done will call back onError
    clock.next();
  });

  test("Several pending transactions", async (done) => {
    const onMessage = sinon.spy(() => {
      expect(onMessage.callCount).toBeLessThan(8);
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
      [
        JSON.stringify(pendingTransaction(0, TransactionStatus.pending_anchor)),
        { status: 200 },
      ],
      [
        JSON.stringify(
          pendingTransaction(1, TransactionStatus.pending_external),
        ),
        { status: 200 },
      ],
      [
        JSON.stringify(
          pendingTransaction(2, TransactionStatus.pending_stellar),
        ),
        { status: 200 },
      ],
      [
        JSON.stringify(pendingTransaction(3, TransactionStatus.pending_trust)),
        { status: 200 },
      ],
      [
        JSON.stringify(pendingTransaction(4, TransactionStatus.pending_user)),
        { status: 200 },
      ],
      [
        JSON.stringify(
          pendingTransaction(
            5,
            TransactionStatus.pending_user_transfer_complete,
          ),
        ),
        { status: 200 },
      ],
      [
        JSON.stringify(
          pendingTransaction(6, TransactionStatus.pending_user_transfer_start),
        ),
        { status: 200 },
      ],
    );

    // start watching
    provider.watchOneTransaction({
      asset_code: "SMX",
      id: successfulTransaction(0, TransactionStatus.pending_anchor).transaction
        .id,
      onMessage,
      onSuccess,
      onError,
      timeout: 10,
      lang: "uk-UA",
    });

    // nothing should run at first
    expect(onMessage.callCount).toBe(0);
    expect(onSuccess.callCount).toBe(0);
    expect(onError.callCount).toBe(0);

    // wait a second, then done will call back onMessage

    clock.next();
    await sleep(10);

    clock.next();
    await sleep(10);

    clock.next();
    await sleep(10);

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

  test("One pending, one completed, no more after that", async () => {
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
      [
        JSON.stringify(
          pendingTransaction(
            0,
            TransactionStatus.pending_user_transfer_complete,
          ),
        ),
        { status: 200 },
      ],
      [
        JSON.stringify(successfulTransaction(0, TransactionStatus.completed)),
        { status: 200 },
      ],
      [
        JSON.stringify(successfulTransaction(0, TransactionStatus.completed)),
        { status: 200 },
      ],
      [
        JSON.stringify(successfulTransaction(0, TransactionStatus.completed)),
        { status: 200 },
      ],
    );

    // start watching
    provider.watchOneTransaction({
      asset_code: "SMX",
      id: successfulTransaction(0, TransactionStatus.completed).transaction.id,
      onMessage,
      onSuccess,
      onError,
      timeout: 10,
      lang: "uk-UA",
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

  test("One pending, one refunded, no more after that", async () => {
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
      [
        JSON.stringify(
          pendingTransaction(
            0,
            TransactionStatus.pending_user_transfer_complete,
          ),
        ),
        { status: 200 },
      ],
      [
        JSON.stringify(successfulTransaction(0, TransactionStatus.refunded)),
        { status: 200 },
      ],
      [
        JSON.stringify(successfulTransaction(0, TransactionStatus.refunded)),
        { status: 200 },
      ],
      [
        JSON.stringify(successfulTransaction(0, TransactionStatus.refunded)),
        { status: 200 },
      ],
    );

    // start watching
    provider.watchOneTransaction({
      asset_code: "SMX",
      id: successfulTransaction(0, TransactionStatus.refunded).transaction.id,
      onMessage,
      onSuccess,
      onError,
      timeout: 10,
      lang: "uk-UA",
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
      [
        JSON.stringify(pendingTransaction(0, TransactionStatus.pending_anchor)),
        { status: 200 },
      ],
      [
        JSON.stringify(failedTransaction(0, TransactionStatus.error)),
        { status: 200 },
      ],
      [
        JSON.stringify(failedTransaction(0, TransactionStatus.error)),
        { status: 200 },
      ],
      [
        JSON.stringify(failedTransaction(0, TransactionStatus.error)),
        { status: 200 },
      ],
    );

    // start watching
    provider.watchOneTransaction({
      asset_code: "SMX",
      id: pendingTransaction(0, TransactionStatus.pending_anchor).transaction
        .id,
      onMessage,
      onSuccess,
      onError,
      timeout: 10,
      lang: "uk-UA",
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

    // the second time, an error should happen
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

  test("One pending, one no_market, no more after that", async () => {
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
      [
        JSON.stringify(pendingTransaction(0, TransactionStatus.pending_anchor)),
        { status: 200 },
      ],
      [
        JSON.stringify(failedTransaction(0, TransactionStatus.no_market)),
        { status: 200 },
      ],
      [
        JSON.stringify(failedTransaction(0, TransactionStatus.no_market)),
        { status: 200 },
      ],
      [
        JSON.stringify(failedTransaction(0, TransactionStatus.no_market)),
        { status: 200 },
      ],
    );

    // start watching
    provider.watchOneTransaction({
      asset_code: "SMX",
      id: pendingTransaction(0, TransactionStatus.pending_anchor).transaction
        .id,
      onMessage,
      onSuccess,
      onError,
      timeout: 10,
      lang: "uk-UA",
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

    // the second time, an error should happen
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
      [
        JSON.stringify(
          pendingTransaction(0, TransactionStatus.pending_user_transfer_start),
        ),
        { status: 200 },
      ],
      [
        JSON.stringify(
          pendingTransaction(
            1,
            TransactionStatus.pending_user_transfer_complete,
          ),
        ),
        { status: 200 },
      ],
      [
        JSON.stringify(failedTransaction(2, TransactionStatus.error)),
        { status: 200 },
      ],
      [
        JSON.stringify(failedTransaction(3, TransactionStatus.error)),
        { status: 200 },
      ],
      [
        JSON.stringify(failedTransaction(4, TransactionStatus.error)),
        { status: 200 },
      ],
    );

    // start watching
    provider.watchOneTransaction({
      asset_code: "SMX",
      id: pendingTransaction(0, TransactionStatus.pending_user_transfer_start)
        .transaction.id,
      onMessage,
      onSuccess,
      onError,
      timeout: 10,
      lang: "uk-UA",
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

describe("watchAllTransactions", () => {
  let clock: sinon.SinonFakeTimers;
  let provider: DepositProvider;

  // suite-wide consts
  const transferServer = "https://www.stellar.org/transfers";

  beforeEach(async () => {
    clock = sinon.useFakeTimers(0);
    // @ts-ignore
    fetch.resetMocks();

    // first, mock fetching info
    // @ts-ignore
    fetch.mockResponseOnce(JSON.stringify(SMXTransferInfo));

    provider = new DepositProvider(
      transferServer,
      StellarSdk.Keypair.random().publicKey(),
      "uk-UA",
    );

    provider.authToken = "test";

    await provider.fetchSupportedAssets();
  });

  afterEach(() => {
    clock.restore();
  });

  test("Return only pending", async () => {
    const onMessage = sinon.spy(() => {
      expect(onMessage.callCount).toBeLessThan(4);
    });

    const onError = sinon.spy((e) => {
      expect(e).toBeUndefined();
    });

    // queue up a success
    // @ts-ignore
    fetch.mockResponses([JSON.stringify(TransactionsResponse)]);

    // start watching
    provider.watchAllTransactions({
      asset_code: "SMX",
      onMessage,
      onError,
      timeout: 10,
      lang: "uk-UA",
    });

    // nothing should run at first
    expect(onMessage.callCount).toBe(0);
    expect(onError.callCount).toBe(0);

    await sleep(1);

    expect(onMessage.callCount).toBe(3);
    expect(onError.callCount).toBe(0);
  });

  test("Return two changed thing", async () => {
    const onMessage = sinon.spy(() => {
      expect(onMessage.callCount).toBeLessThan(6);
    });

    const onError = sinon.spy((e) => {
      expect(e).toBeUndefined();
    });

    // queue up a success
    // @ts-ignore
    fetch.mockResponses([JSON.stringify(TransactionsResponse)]);

    // start watching
    provider.watchAllTransactions({
      asset_code: "SMX",
      onMessage,
      onError,
      timeout: 10,
      lang: "uk-UA",
    });

    // nothing should run at first
    expect(onMessage.callCount).toBe(0);
    expect(onError.callCount).toBe(0);

    await sleep(1);

    expect(onMessage.callCount).toBe(3);
    expect(onError.callCount).toBe(0);

    // change one thing to "completed"
    const [firstResponseA, ...restA] = TransactionsResponse.transactions;
    let updatedTransactions = [
      {
        ...firstResponseA,
        status: TransactionStatus.completed,
      },
      ...restA,
    ];

    // @ts-ignore
    fetch.mockResponses([
      JSON.stringify({
        ...TransactionsResponse,
        transactions: updatedTransactions,
      }),
    ]);

    clock.next();
    await sleep(10);

    expect(onMessage.callCount).toBe(4);
    expect(onError.callCount).toBe(0);

    await sleep(1);

    expect(onMessage.callCount).toBe(4);
    expect(onError.callCount).toBe(0);

    // change another thing to "refunded"
    const [firstResponseB, secondResponseB, ...restB] = updatedTransactions;
    updatedTransactions = [
      firstResponseB,
      {
        ...secondResponseB,
        status: TransactionStatus.refunded,
      },
      ...restB,
    ];

    // @ts-ignore
    fetch.mockResponses([
      JSON.stringify({
        ...TransactionsResponse,
        transactions: updatedTransactions,
      }),
    ]);

    clock.next();
    await sleep(10);

    expect(onMessage.callCount).toBe(5);
    expect(onError.callCount).toBe(0);
  });

  test("Immediate completed get messages", async () => {
    const onMessage = sinon.spy(() => {
      expect(onMessage.callCount).toBeLessThan(2);
    });

    const onError = sinon.spy((e) => {
      expect(e).toBeUndefined();
    });

    // queue up a success
    // @ts-ignore
    fetch.mockResponses([
      JSON.stringify({
        status: true,
        transactions: [],
      }),
    ]);

    // start watching
    provider.watchAllTransactions({
      asset_code: "SMX",
      onMessage,
      onError,
      timeout: 10,
      lang: "uk-UA",
    });

    // nothing should run at first
    expect(onMessage.callCount).toBe(0);
    expect(onError.callCount).toBe(0);

    await sleep(1);

    // still nothing
    expect(onMessage.callCount).toBe(0);
    expect(onError.callCount).toBe(0);

    // add a new success message
    // @ts-ignore
    fetch.mockResponses([
      JSON.stringify({
        status: true,
        transactions: [
          {
            id: 74,
            order_id: "ord_2mPmw2EBF5iCN2nWv",
            status: "completed",
            receiving_account_number: "646180111812345678",
            receiving_account_bank: "STP",
            memo: null,
            memo_type: null,
            email_address: null,
            type: "SPEI",
            asset_code: "SMX",
            expires_at: "1970-01-19T06:08:23.883Z",
            created_at: "2019-09-26T19:58:03.856Z",
            phone: "+14155099007",
            amount: "25.00",
            account: "GARBRF35ZWKO4MIEY7RPHHPQ74P45TWNMIQ5VKOTXF7KYVFJBGWW2IMQ",
            transaction_id: "DI8AADD303D3686399",
            external_transaction_id: "DI8AADD303D3686399",
            kind: "deposit",
          },
        ],
      }),
    ]);

    clock.next();
    await sleep(10);

    // should have a success
    expect(onMessage.callCount).toBe(1);
    expect(onError.callCount).toBe(0);

    // getting the same thing again should change nothing
    // @ts-ignore
    fetch.mockResponses([
      JSON.stringify({
        status: true,
        transactions: [
          {
            id: 74,
            order_id: "ord_2mPmw2EBF5iCN2nWv",
            status: "completed",
            receiving_account_number: "646180111812345678",
            receiving_account_bank: "STP",
            memo: null,
            memo_type: null,
            email_address: null,
            type: "SPEI",
            asset_code: "SMX",
            expires_at: "1970-01-19T06:08:23.883Z",
            created_at: "2019-09-26T19:58:03.856Z",
            phone: "+14155099007",
            amount: "25.00",
            account: "GARBRF35ZWKO4MIEY7RPHHPQ74P45TWNMIQ5VKOTXF7KYVFJBGWW2IMQ",
            transaction_id: "DI8AADD303D3686399",
            external_transaction_id: "DI8AADD303D3686399",
            kind: "deposit",
          },
        ],
      }),
    ]);

    clock.next();
    await sleep(10);

    expect(onMessage.callCount).toBe(1);
    expect(onError.callCount).toBe(0);
  });

  test("Immediate refunded get messages", async () => {
    const onMessage = sinon.spy(() => {
      expect(onMessage.callCount).toBeLessThan(2);
    });

    const onError = sinon.spy((e) => {
      expect(e).toBeUndefined();
    });

    // queue up a success
    // @ts-ignore
    fetch.mockResponses([
      JSON.stringify({
        status: true,
        transactions: [],
      }),
    ]);

    // start watching
    provider.watchAllTransactions({
      asset_code: "SMX",
      onMessage,
      onError,
      timeout: 10,
      lang: "uk-UA",
    });

    // nothing should run at first
    expect(onMessage.callCount).toBe(0);
    expect(onError.callCount).toBe(0);

    await sleep(1);

    // still nothing
    expect(onMessage.callCount).toBe(0);
    expect(onError.callCount).toBe(0);

    // add a new success message
    // @ts-ignore
    fetch.mockResponses([
      JSON.stringify({
        status: true,
        transactions: [
          {
            id: 77,
            order_id: "ord_2mRPdvpUjPN2rfuS7",
            status: "refunded",
            receiving_account_number: "646180111812345678",
            receiving_account_bank: "STP",
            memo: null,
            memo_type: null,
            email_address: null,
            type: "SPEI",
            asset_code: "SMX",
            expires_at: "1970-01-19T09:23:30.864Z",
            created_at: "2019-10-01T20:34:24.753Z",
            phone: "+14155099007",
            amount: "25.00",
            account: "GARBRF35ZWKO4MIEY7RPHHPQ74P45TWNMIQ5VKOTXF7KYVFJBGWW2IMQ",
            transaction_id: "DI938432727A0B2456",
            external_transaction_id: "DI938432727A0B2456",
            kind: "deposit",
          },
        ],
      }),
    ]);

    clock.next();
    await sleep(10);

    // should have a success
    expect(onMessage.callCount).toBe(1);
    expect(onError.callCount).toBe(0);

    // getting the same thing again should change nothing
    // @ts-ignore
    fetch.mockResponses([
      JSON.stringify({
        status: true,
        transactions: [
          {
            id: 77,
            order_id: "ord_2mRPdvpUjPN2rfuS7",
            status: "refunded",
            receiving_account_number: "646180111812345678",
            receiving_account_bank: "STP",
            memo: null,
            memo_type: null,
            email_address: null,
            type: "SPEI",
            asset_code: "SMX",
            expires_at: "1970-01-19T09:23:30.864Z",
            created_at: "2019-10-01T20:34:24.753Z",
            phone: "+14155099007",
            amount: "25.00",
            account: "GARBRF35ZWKO4MIEY7RPHHPQ74P45TWNMIQ5VKOTXF7KYVFJBGWW2IMQ",
            transaction_id: "DI938432727A0B2456",
            external_transaction_id: "DI938432727A0B2456",
            kind: "deposit",
          },
        ],
      }),
    ]);

    clock.next();
    await sleep(10);

    expect(onMessage.callCount).toBe(1);
    expect(onError.callCount).toBe(0);
  });
});

describe("validateFields", () => {
  const asset_code = "TEST";

  function getProvider(fields: Field[]): DepositProvider {
    const provider = new DepositProvider(
      "https://test.com",
      StellarSdk.Keypair.random().publicKey(),
      "en-US",
    );
    provider.info = {
      deposit: {
        [asset_code]: {
          asset_code,
          fee: { type: "simple" },
          fields,
          min_amount: 0,
        },
      },
      withdraw: {},
    };
    provider.authToken = "test";

    return provider;
  }

  test("returns true for empty fields", () => {
    expect(getProvider([]).validateFields(asset_code, {})).toEqual(true);
  });
  test("returns true for correct response", () => {
    const fields = [
      {
        description: "your email address for transaction status updates",
        optional: true,
        name: "email_address",
      },
      {
        description: "amount in cents that you plan to deposit",
        name: "amount",
      },
      {
        description: "type of deposit to make",
        choices: ["SPEI", "cash"],
        name: "type",
      },
    ];

    expect(
      getProvider(fields).validateFields(asset_code, {
        email: "asdf@asdf.com",
        amount: "10",
        type: "SPEI",
      }),
    ).toEqual(true);
  });
  test("returns false for invalid type", () => {
    const fields = [
      {
        description: "your email address for transaction status updates",
        optional: true,
        name: "email_address",
      },
      {
        description: "amount in cents that you plan to deposit",
        name: "amount",
      },
      {
        description: "type of deposit to make",
        choices: ["SPEI", "cash"],
        name: "type",
      },
    ];

    expect(
      getProvider(fields).validateFields(asset_code, {
        email: "asdf@asdf.com",
        amount: "10",
        type: "asdlkfjasldkfjaskdlfjask",
      }),
    ).toEqual(false);
  });
  test("returns false for invalid email", () => {
    const fields = [
      {
        description: "your email address for transaction status updates",
        name: "email_address",
      },
      {
        description: "amount in cents that you plan to deposit",
        name: "amount",
      },
      {
        description: "type of deposit to make",
        choices: ["SPEI", "cash"],
        name: "type",
      },
    ];

    expect(
      getProvider(fields).validateFields(asset_code, {
        email: "asdf",
        amount: "10",
        type: "cash",
      }),
    ).toEqual(false);
  });
  test("returns false for invalid amount", () => {
    const fields = [
      {
        description: "your email address for transaction status updates",
        optional: true,
        name: "email_address",
      },
      {
        description: "amount in cents that you plan to deposit",
        name: "amount",
      },
      {
        description: "type of deposit to make",
        choices: ["SPEI", "cash"],
        name: "type",
      },
    ];

    expect(
      getProvider(fields).validateFields(asset_code, {
        email: "asdf@asdf.com",
        amount: "asdf",
        type: "cash",
      }),
    ).toEqual(false);
  });

  test("real-world case", () => {
    const fields = [
      {
        description: "Enter the amount in ARS that you plan to deposit",
        name: "amount",
      },
      { description: "Enter your email address", name: "email_address" },
    ];
    const payload = {
      amount: "255",
      asset_code: "ARS",
      email_address: "cassio@stellar.org",
    };
    expect(getProvider(fields).validateFields(asset_code, payload)).toEqual(
      true,
    );
  });
});
