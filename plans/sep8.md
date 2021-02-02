## SEP-8 regulated assets

Approval service API for transacting with an anchor's regulated assets.

The high-level flow is:

- User signs a transaction
- Parse the transaction for assets involved, detect whether any assets involved
  are regulated
- If regulated, notify the user to submit a request for transaction approval
- Submit the transaction to the corresponding approval server, and depending on
  the response:
  - if success
    - Display the message if included in the response
    - Submit the approved tx to the network
  - if revised
    - Display the message
    - Parse the returned tx, display modifications to the user
    - Prompt the user to re-sign the tx
    - Submit the resigned tx to the network
  - if pending
    - Display the timeout if it is not zero
    - Display the message if included in the response
  - if action_required
    - Display the message
    - if action_method is GET or not provided, action_url should be opened in a
      browser and any fields passed should allow the server to proceed without
      collecting user information
    - if action_method is POST, fields included in action_fields may be passed
      as JSON without user intervention
  - if rejected
    - Display the error

### Types

```ts
// This function returns the first regulated asset found in the transaction, if any.
// The returned asset will be in the format of "Code:AssetIssuer".
type checkRegulatedAssetInTx = (params: Transaction) => string;

// This function returns the home_domain in the asset issuer's account, if any.
// This function takes an asset in the format of "Code:AssetIssuer".
type getHomeDomainByAsset = (params: string) => Promise<string>;

// Get the approval server's URL by fetching the stellar.toml file at the home domain and look for the matched currency.
type getApprovalServerUrl = (
  params: GetApprovalServerUrlRequest,
) => Promise<string>;

interface GetApprovalServerUrlReqeust {
  homeDomain: string;
  regulatedAsset: string;
}

class ApprovalProvider {
  constructor(approvalServerUrl) {}
  approve: (params: Transaction) => Promise<ApprovalResponse>;
  postActionUrl: ({
    url: string;
    fields: string[];
    values: any[];
  }) => Promise<PostActionUrlResponse>;
}

interface ApprovalResponse {
  status: "success" | "revised" | "pending" | "action_required" | "rejected";
}

interface TransactionApproved extends ApprovalResponse {
  status: "success";
  tx: string;
  message?: string;
}

interface TransactionRevised extends ApprovalResponse {
  status: "revised";
  tx: string;
  message: string;
}

interface PendingApproval extends ApprovalResponse {
  status: "pending";
  timeout: number;
  message?: string;
}

interface ActionRequired extends ApprovalResponse {
  status: "action_required";
  message: string;
  action_url: string;
  action_method?: string;
  action_fields?: string[];
}

interface TransactionRejected extends ApprovalResponse {
  status: "rejected";
  error: string;
}

interface PostActionUrlResponse {
  result: string;
  next_url?: string;
}
```

### Usage

```js
import {
  ApprovalProvider,
  ApprovalResponseType,
  checkRegulatedAssetInTx,
  getHomeDomainByAsset,
  getApprovalServerUrl,
} from "wallet-sdk";

// Parse transaction to check if it involves regulated assets
const regulatedAsset = checkRegulatedAssetInTx(transaction);
if (!regulatedAsset) {
  // No approval needed so submit to the network
  submitPayment(transaction);
  return;
}

// TODO: check whether the user is already authorized to transact the asset.

const homeDomain = await getHomeDomainByAsset(regulatedAsset);
if (!homeDomain) {
  // Report an error saying a certain information is missing in order to transact the asset.
  return;
}

const approvalServerUrl = await getApprovalServerUrl({
  homeDomain: homeDomain,
  regulatedAsset: regulatedAsset,
});
if (!approvalServerUrl) {
  // Report an error saying a certain information is missing in order to transact the asset.
  return;
}

const approvalProvider = new ApprovalProvider(approvalServerUrl);

// Notify user asking for approval
showUser(transaction);

const approvalResponse = await approvalProvider.approve(transaction);

switch (approvalResponse.status) {
  case ApprovalResponseStatus.success:
  case ApprovalResponseStatus.revised:
    // Placeholder to show the success/revised message if returned
    showUser(approvalResponse);

    // Set the approved transaction
    transaction = new Transaction(approvalResponse.tx);

    // Submit approved transaction to the network
    submitPayment(transaction);
    break;
  case ApprovalResponseStatus.pending:
    // Placeholder that notifies user approval pending and time need
    // to wait before resubmitting tx for approval
    showUser(approvalResponse);
    break;
  case ApprovalResponseStatus.action_required:
    // Placeholder to show the message regarding why further actions are required.
    showUser(approvalResponse.message);

    // If the approval service requested specific fields, load the values of those fields if we know them,
    // or if we'd like to collect them client side before taking the user to the action url.
    let actionFieldsValues = [];
    if (!approvalResponse.action_fields || !approvalResponse.action_fields.length) {
          actionFieldValues = approvalResponse.action_fields.map(field => loadValue(field););
    }

    if (!approvalResponse.action_method || approvalResponse.action_method === "GET") {
      let actionUrl = approvalResponse.action_url;
      if (!actionFieldsValues.length) {
        actionUrl = buildUrlWithQueryParams(approvalResponse.action_url, approvalResponse.action_fields, actionFieldValues);
      }

      // The actual implementation regarding how to trigger the sending of the GET request and handle the response is up to the client.
      loadUrl(actionUrl);
    } else if (approvalResponse.action_method === "POST") {
      const resp = await approvalProvider.postActionUrl({
        url: approvalResponse.action_url,
        fields: approvalResponse.action_fields,
        values: actionFieldsValues,
      });

      if (resp.result === "follow_next_url") {
        // Load the URL in a browser for the user to complete any further action required.
        loadUrl(resp.next_url);
      }
    }
    break;
  case ApprovalResponseStatus.rejected:
    // Notify user of the rejection
    showUser(approvalResponse);
    break;
  default:
  // There was an error
}
```
