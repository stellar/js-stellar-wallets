import { Transaction } from "stellar-base";
import { FeeBumpTransaction } from "stellar-sdk";
import { ApprovalResponseStatus } from "../constants/sep8";
import { ApprovalResponse } from "../types/sep8";

export class ApprovalProvider {
  public approvalServer: string;

  constructor(approvalServer: string) {
    if (!approvalServer) {
      throw new Error("Required parameter 'approvalServer' missing!");
    }

    this.approvalServer = approvalServer.replace(/\/$/, "");
  }

  public async approve(
    transaction: Transaction | FeeBumpTransaction,
    contentType:
      | "application/json"
      | "application/x-www-form-urlencoded" = "application/json",
  ): Promise<ApprovalResponse> {
    if (!transaction.signatures.length) {
      throw new Error(
        "At least one signature is required before submitting for approval.",
      );
    }

    const param = {
      tx: transaction
        .toEnvelope()
        .toXDR()
        .toString("base64"),
    };

    let response;
    if (contentType === "application/json") {
      response = await fetch(this.approvalServer, {
        method: "POST",
        body: JSON.stringify(param),
        headers: {
          "Content-Type": "application/json",
        },
      });
    } else {
      const urlParam = new URLSearchParams(param);
      response = await fetch(this.approvalServer, {
        method: "POST",
        body: urlParam.toString(),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
    }

    if (!response.ok) {
      const responseText = await response.text();
      throw new Error(
        `Error sending base64-encoded transaction to ${
          this.approvalServer
        }: error code ${response.status}, status text: "${responseText}"`,
      );
    }

    const responseOKText = await response.text();
    let res;
    try {
      res = JSON.parse(responseOKText) as ApprovalResponse;
    } catch (e) {
      throw new Error(
        `Error parsing the approval server response as JSON: ${responseOKText}`,
      );
    }

    if (
      res.status !== ApprovalResponseStatus.success &&
      res.status !== ApprovalResponseStatus.revised &&
      res.status !== ApprovalResponseStatus.pending &&
      res.status !== ApprovalResponseStatus.actionRequired &&
      res.status !== ApprovalResponseStatus.rejected
    ) {
      throw new Error(`Approval server returned unknown status: ${res.status}`);
    }
    return res;
  }
}
