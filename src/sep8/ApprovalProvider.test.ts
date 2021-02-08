import StellarBase from "stellar-base";
import { ApprovalResponseStatus } from "../constants/sep8";
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
      expect(e).toBeTruthy();
    }
  });
});

describe("approve", () => {
  beforeEach(() => {
    // @ts-ignore
    fetch.resetMocks();
  });

  test("transaction has no signature", async () => {
    const accountKey = StellarBase.Keypair.random();
    const account = new StellarBase.Account(accountKey.publicKey(), "0");
    const keyNetwork = StellarBase.Networks.TESTNET;

    const txBuild = new StellarBase.TransactionBuilder(account, {
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
      expect(e.toString()).toMatch(
        `At least one signature is required before submitting for approval.`,
      );
    }
  });

  test("success response", async () => {
    const accountKey = StellarBase.Keypair.random();
    const account = new StellarBase.Account(accountKey.publicKey(), "0");
    const keyNetwork = StellarBase.Networks.TESTNET;

    const txBuild = new StellarBase.TransactionBuilder(account, {
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
    const accountKey = StellarBase.Keypair.random();
    const account = new StellarBase.Account(accountKey.publicKey(), "0");
    const keyNetwork = StellarBase.Networks.TESTNET;

    const txBuild = new StellarBase.TransactionBuilder(account, {
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
    const accountKey = StellarBase.Keypair.random();
    const account = new StellarBase.Account(accountKey.publicKey(), "0");
    const keyNetwork = StellarBase.Networks.TESTNET;

    const txBuild = new StellarBase.TransactionBuilder(account, {
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
    const accountKey = StellarBase.Keypair.random();
    const account = new StellarBase.Account(accountKey.publicKey(), "0");
    const keyNetwork = StellarBase.Networks.TESTNET;

    const txBuild = new StellarBase.TransactionBuilder(account, {
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
      expect(resActionRequired.action_url).toBeDefined();
      expect(resActionRequired.message).toBeDefined();
    } catch (e) {
      expect(e).toBe(null);
    }
  });

  test("rejected response", async () => {
    const accountKey = StellarBase.Keypair.random();
    const account = new StellarBase.Account(accountKey.publicKey(), "0");
    const keyNetwork = StellarBase.Networks.TESTNET;

    const txBuild = new StellarBase.TransactionBuilder(account, {
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
      expect(txRejected.error).toBeDefined();
    } catch (e) {
      expect(e).toBe(null);
    }
  });
});
