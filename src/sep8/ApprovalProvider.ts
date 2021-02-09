import { Transaction } from "stellar-base";
import { FeeBumpTransaction } from "stellar-sdk";
import { ApprovalResponseStatus } from "../constants/sep8";
import {
  ApprovalResponse,
  PostActionUrlRequest,
  PostActionUrlResponse,
} from "../types/sep8";

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

    const acceptedStatuses = [
      ApprovalResponseStatus.success,
      ApprovalResponseStatus.revised,
      ApprovalResponseStatus.pending,
      ApprovalResponseStatus.actionRequired,
      ApprovalResponseStatus.rejected,
    ];
    if (!acceptedStatuses.includes(res.status)) {
      throw new Error(`Approval server returned unknown status: ${res.status}`);
    }
    return res;
  }

  public async postActionUrl(
    params: PostActionUrlRequest,
  ): Promise<PostActionUrlResponse> {
    if (!params.action_url) {
      throw new Error("Required field 'action_url' missing!");
    }
    if (
      !Object.keys(params.field_value_map) ||
      !Object.keys(params.field_value_map).length
    ) {
      throw new Error("Required field 'field_value_map' missing!");
    }

    const response = await fetch(params.action_url, {
      method: "POST",
      body: JSON.stringify(params.field_value_map),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const responseText = await response.text();
      throw new Error(
        `Error sending POST request to ${params.action_url}: error code ${
          response.status
        }, status text: "${responseText}"`,
      );
    }

    const responseOKText = await response.text();
    try {
      return JSON.parse(responseOKText) as PostActionUrlResponse;
    } catch (e) {
      throw new Error(`Error parsing the response as JSON: ${responseOKText}`);
    }
  }
}
