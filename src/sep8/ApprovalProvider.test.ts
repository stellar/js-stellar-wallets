import {
  Account,
  Keypair,
  Networks,
  TransactionBuilder,
} from "@stellar/stellar-sdk";
import { ActionResult, ApprovalResponseStatus } from "../constants/sep8";
import {
  ActionRequired,
  PendingApproval,
  TransactionApproved,
  TransactionRejected,
  TransactionRevised,
} from "../types/sep8";
import { ApprovalProvider } from "./ApprovalProvider";

describe("ApprovalProvider", () => {
  test("Throws errors for missing param", async () => {
    try {
      // @ts-ignore
      const approvalProvider = new ApprovalProvider("");
      expect("This test failed").toBe(null);
    } catch (e) {
      expect((e as any).toString()).toMatch(
        `Error: Required parameter 'approvalServer' missing!`,
      );
    }
  });
});

describe("approve", () => {
  beforeEach(() => {
    // @ts-ignore
    fetch.resetMocks();
  });

  test("transaction has no signature", async () => {
    const accountKey = Keypair.random();
    const account = new Account(accountKey.publicKey(), "0");
    const keyNetwork = Networks.TESTNET;

    const txBuild = new TransactionBuilder(account, {
      fee: "10000",
      networkPassphrase: keyNetwork,
    })
      .setTimeout(1000)
      .build();

    const approvalServer = "https://www.stellar.org/approve";
    const approvalProvider = new ApprovalProvider(approvalServer);
    try {
      // @ts-ignore
      await approvalProvider.approve(txBuild);
      expect("This test failed").toBe(null);
    } catch (e) {
      expect((e as any).toString()).toMatch(
        `At least one signature is required before submitting for approval.`,
      );
    }
  });

  test("approval server returned an unknown status", async () => {
    const accountKey = Keypair.random();
    const account = new Account(accountKey.publicKey(), "0");
    const keyNetwork = Networks.TESTNET;

    const txBuild = new TransactionBuilder(account, {
      fee: "10000",
      networkPassphrase: keyNetwork,
    })
      .setTimeout(1000)
      .build();
    txBuild.sign(accountKey);

    // @ts-ignore
    fetch.mockResponseOnce(
      JSON.stringify({
        error: "unable to process the transaction",
      }),
    );

    const approvalServer = "https://www.stellar.org/approve";
    const approvalProvider = new ApprovalProvider(approvalServer);
    try {
      // @ts-ignore
      await approvalProvider.approve(txBuild);
      expect("This test failed").toBe(null);
    } catch (e) {
      expect((e as any).toString()).toContain(
        `Error: Approval server returned unknown status`,
      );
    }
  });

  test("approval server could not be found", async () => {
    const accountKey = Keypair.random();
    const account = new Account(accountKey.publicKey(), "0");
    const keyNetwork = Networks.TESTNET;

    const txBuild = new TransactionBuilder(account, {
      fee: "10000",
      networkPassphrase: keyNetwork,
    })
      .setTimeout(1000)
      .build();
    txBuild.sign(accountKey);

    // @ts-ignore
    fetch.mockResponseOnce(
      JSON.stringify({
        error: "not found",
      }),
      { status: 404 },
    );

    const approvalServer = "https://www.stellar.org/approve";
    const approvalProvider = new ApprovalProvider(approvalServer);
    try {
      // @ts-ignore
      await approvalProvider.approve(txBuild);
      expect("This test failed").toBe(null);
    } catch (e) {
      expect((e as any).toString()).toContain(
        `Error: Error sending base64-encoded transaction`,
      );
    }
  });

  test("approval server returns a JSON error", async () => {
    const accountKey = Keypair.random();
    const account = new Account(accountKey.publicKey(), "0");
    const keyNetwork = Networks.TESTNET;

    const txBuild = new TransactionBuilder(account, {
      fee: "10000",
      networkPassphrase: keyNetwork,
    })
      .setTimeout(1000)
      .build();
    txBuild.sign(accountKey);

    // @ts-ignore
    fetch.mockResponseOnce("unable to process the transaction");

    const approvalServer = "https://www.stellar.org/approve";
    const approvalProvider = new ApprovalProvider(approvalServer);
    try {
      // @ts-ignore
      await approvalProvider.approve(txBuild);
      expect("This test failed").toBe(null);
    } catch (e) {
      expect((e as any).toString()).toContain(
        `Error: Error parsing the approval server response as JSON`,
      );
    }
  });

  test("success response", async () => {
    const accountKey = Keypair.random();
    const account = new Account(accountKey.publicKey(), "0");
    const keyNetwork = Networks.TESTNET;

    const txBuild = new TransactionBuilder(account, {
      fee: "10000",
      networkPassphrase: keyNetwork,
    })
      .setTimeout(1000)
      .build();
    txBuild.sign(accountKey);

    const tx = txBuild.toXDR();

    const success = {
      status: "success",
      tx,
    };

    // @ts-ignore
    fetch.mockResponseOnce(JSON.stringify(success));

    const approvalServer = "https://www.stellar.org/approve";
    const approvalProvider = new ApprovalProvider(approvalServer);

    try {
      const res = await approvalProvider.approve(txBuild);
      expect(res).toEqual(success);
      expect(res.status).toBe(ApprovalResponseStatus.success);
      const txApproved = res as TransactionApproved;
      expect(txApproved.tx).toBe(tx);
    } catch (e) {
      expect(e).toBe(null);
    }
  });

  test("revised response", async () => {
    const accountKey = Keypair.random();
    const account = new Account(accountKey.publicKey(), "0");
    const keyNetwork = Networks.TESTNET;

    const txBuild = new TransactionBuilder(account, {
      fee: "10000",
      networkPassphrase: keyNetwork,
    })
      .setTimeout(1000)
      .build();
    txBuild.sign(accountKey);

    const tx = txBuild.toXDR();

    const revised = {
      status: "revised",
      tx: "This is a base64-encoded transaction revised by the approval server",
      message: "Added authorization and deauthorization operations",
    };

    // @ts-ignore
    fetch.mockResponseOnce(JSON.stringify(revised));

    const approvalServer = "https://www.stellar.org/approve";
    const approvalProvider = new ApprovalProvider(approvalServer);

    try {
      const res = await approvalProvider.approve(txBuild);
      expect(res).toEqual(revised);
      expect(res.status).toBe(ApprovalResponseStatus.revised);
      const txRevised = res as TransactionRevised;
      expect(txRevised.tx).not.toMatch(tx);
      expect(txRevised.message).toBeTruthy();
    } catch (e) {
      expect(e).toBe(null);
    }
  });

  test("pending response", async () => {
    const accountKey = Keypair.random();
    const account = new Account(accountKey.publicKey(), "0");
    const keyNetwork = Networks.TESTNET;

    const txBuild = new TransactionBuilder(account, {
      fee: "10000",
      networkPassphrase: keyNetwork,
    })
      .setTimeout(1000)
      .build();
    txBuild.sign(accountKey);

    const pending = {
      status: "pending",
      timeout: 0,
    };

    // @ts-ignore
    fetch.mockResponseOnce(JSON.stringify(pending));

    const approvalServer = "https://www.stellar.org/approve";
    const approvalProvider = new ApprovalProvider(approvalServer);

    try {
      const res = await approvalProvider.approve(txBuild);
      expect(res).toEqual(pending);
      expect(res.status).toBe(ApprovalResponseStatus.pending);
      const txPending = res as PendingApproval;
      expect(txPending.timeout).toBeGreaterThanOrEqual(0);
    } catch (e) {
      expect(e).toBe(null);
    }
  });

  test("action required response", async () => {
    const accountKey = Keypair.random();
    const account = new Account(accountKey.publicKey(), "0");
    const keyNetwork = Networks.TESTNET;

    const txBuild = new TransactionBuilder(account, {
      fee: "10000",
      networkPassphrase: keyNetwork,
    })
      .setTimeout(1000)
      .build();
    txBuild.sign(accountKey);

    const actionRequired = {
      status: "action_required",
      action_url: "the url to provide the required actions",
      message: "Please provide extra information",
    };

    // @ts-ignore
    fetch.mockResponseOnce(JSON.stringify(actionRequired));

    const approvalServer = "https://www.stellar.org/approve";
    const approvalProvider = new ApprovalProvider(approvalServer);

    try {
      const res = await approvalProvider.approve(txBuild);
      expect(res).toEqual(actionRequired);
      expect(res.status).toBe(ApprovalResponseStatus.actionRequired);
      const resActionRequired = res as ActionRequired;
      expect(resActionRequired.action_url).toBeTruthy();
      expect(resActionRequired.message).toBeTruthy();
    } catch (e) {
      expect(e).toBe(null);
    }
  });

  test("rejected response", async () => {
    const accountKey = Keypair.random();
    const account = new Account(accountKey.publicKey(), "0");
    const keyNetwork = Networks.TESTNET;

    const txBuild = new TransactionBuilder(account, {
      fee: "10000",
      networkPassphrase: keyNetwork,
    })
      .setTimeout(1000)
      .build();
    txBuild.sign(accountKey);

    const rejected = {
      status: "rejected",
      error: "The destination account is blocked.",
    };

    // @ts-ignore
    fetch.mockResponseOnce(JSON.stringify(rejected));

    const approvalServer = "https://www.stellar.org/approve";
    const approvalProvider = new ApprovalProvider(approvalServer);

    try {
      const res = await approvalProvider.approve(txBuild);
      expect(res).toEqual(rejected);
      expect(res.status).toBe(ApprovalResponseStatus.rejected);
      const txRejected = res as TransactionRejected;
      expect(txRejected.error).toBeTruthy();
    } catch (e) {
      expect(e).toBe(null);
    }
  });
});

describe("postActionUrl", () => {
  beforeEach(() => {
    // @ts-ignore
    fetch.resetMocks();
  });

  test("Throws errors for missing action_url", async () => {
    const approvalServer = "https://www.stellar.org/approve";
    const approvalProvider = new ApprovalProvider(approvalServer);

    try {
      // @ts-ignore
      const res = await approvalProvider.postActionUrl({});
      expect("This test failed").toBe(null);
    } catch (e) {
      expect((e as any).toString()).toMatch(
        `Error: Required field 'action_url' missing!`,
      );
    }
  });

  test("Throws errors for missing field_value_map", async () => {
    const approvalServer = "https://www.stellar.org/approve";
    const approvalProvider = new ApprovalProvider(approvalServer);

    try {
      // @ts-ignore
      const res = await approvalProvider.postActionUrl({
        action_url: "https://action.url",
        field_value_map: {},
      });
      expect("This test failed").toBe(null);
    } catch (e) {
      expect((e as any).toString()).toMatch(
        `Error: Required field 'field_value_map' missing!`,
      );
    }
  });

  test("no further action required response", async () => {
    const noFutherAction = {
      result: ActionResult.noFurtherActionRequired,
    };

    // @ts-ignore
    fetch.mockResponseOnce(JSON.stringify(noFutherAction));

    const approvalServer = "https://www.stellar.org/approve";
    const approvalProvider = new ApprovalProvider(approvalServer);

    try {
      const res = await approvalProvider.postActionUrl({
        action_url: "https://action.url",
        field_value_map: {
          email: "hello@example.com",
        },
      });
      expect(res).toEqual(noFutherAction);
    } catch (e) {
      expect(e).toBe(null);
    }
  });

  test("follow next url response", async () => {
    const followNextUrl = {
      result: ActionResult.followNextUrl,
      next_url: "https://next.url",
    };

    // @ts-ignore
    fetch.mockResponseOnce(JSON.stringify(followNextUrl));

    const approvalServer = "https://www.stellar.org/approve";
    const approvalProvider = new ApprovalProvider(approvalServer);

    try {
      const res = await approvalProvider.postActionUrl({
        action_url: "https://action.url",
        field_value_map: {
          email: "hello@example.com",
        },
      });
      expect(res).toEqual(followNextUrl);
    } catch (e) {
      expect(e).toBe(null);
    }
  });
});
