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
// This function returns the regulated assets found in the transaction, if any.
type getRegulatedAssetsInTx = (
  params: Transaction,
) => Promise<RegulatedAssetInfo[]>;

// Get the approval server's URL by fetching the stellar.toml file at the home domain and look for the matched currency.
type getApprovalServerUrl = (params: RegulatedAssetInfo) => Promise<string>;

class ApprovalProvider {
  constructor(approvalServerUrl) {}
  approve: (params: Transaction) => Promise<ApprovalResponse>;
  postActionUrl: (
    params: PostActionUrlRequest,
  ) => Promise<PostActionUrlResponse>;
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

interface PostActionUrlRequest {
  action_url: string;
  field_value_map: { [key: string]: any };
}

interface PostActionUrlResponse {
  result: ActionResult;
  next_url?: string;
  message?: string;
}
```

### Usage

```js
import {
  ApprovalProvider,
  ApprovalResponseType,
  getRegulatedAssetsInTx,
  getApprovalServerUrl,
} from "wallet-sdk";

// Parse transaction to check if it involves regulated assets
const regulatedAssets = getRegulatedAssetsInTx(transaction);
if (!regulatedAssets.length) {
  // No approval needed so submit to the network
  submitPayment(transaction);
  return;
}

// TODO: check whether the user is already authorized to transact the asset.
const regulatedAsset = regulatedAssets[0];
if (!regulatedAsset.home_domain) {
  // Report an error saying a certain information is missing in order to transact the asset.
  return;
}

const approvalServerUrl = await getApprovalServerUrl(regulatedAsset);
if (!approvalServerUrl) {
  // Report an error saying a certain information is missing in order to transact the asset.
  return;
}

const approvalProvider = new ApprovalProvider(approvalServerUrl);

// Notify user asking for approval
showUser(transaction);
userSignTx(transaction);

const approvalResponse = await approvalProvider.approve(transaction);

switch (approvalResponse.status) {
  case ApprovalResponseStatus.success:
    const res = approvalResponse as TransactionApproved
    // Placeholder to show the success message if returned
    showUser(res.message);

    // Set the approved transaction
    transaction = new Transaction(res.tx);

    // Submit approved transaction to the network
    submitPayment(transaction);
    break;
  case ApprovalResponseStatus.revised:
    const res = approvalResponse as TransactionRevised
    // Placeholder to show the revised message and the difference between the original transaction and the revised transaction
    showUser(res);

    // Set the approved transaction
    transaction = new Transaction(res.tx);

    // User needs to sign the transaction because it was revised.
    userSignTx(transaction)

    // Submit approved transaction to the network
    submitPayment(transaction);
    break;
  case ApprovalResponseStatus.pending:
    const res = approvalResponse as PendingApproval
    // Placeholder that notifies user approval pending and time need
    // to wait before resubmitting tx for approval
    showUser(res);
    break;
  case ApprovalResponseStatus.action_required:
    const res = approvalResponse as ActionRequired
    // Placeholder to show the message regarding why further actions are required.
    showUser(res.message);

    // If the approval service requested specific fields, load the values of those fields if we know them,
    // or if we'd like to collect them client side before taking the user to the action url.
    let actionFieldsValues = [];
    if (!res.action_fields || !res.action_fields.length) {
          actionFieldValues = res.action_fields.map(field => loadValue(field););
    }

    const fieldValueMap = {}
    for (let i in res.action_fields) {
      fieldValueMap[res.action_fields[i]] = actionFieldValues[i]
    }

    if (!res.action_method || res.action_method === "GET") {
      let actionUrl = res.action_url;
      if (!actionFieldsValues.length) {
        actionUrl = buildUrlWithQueryParams(res.action_url, fieldValueMap);
      }

      // The actual implementation regarding how to trigger the sending of the GET request and handle the response is up to the client.
      loadUrl(actionUrl);
    } else if (res.action_method === "POST") {
      const resp = await approvalProvider.postActionUrl({
        action_url: res.action_url,
        field_value_map: fieldValueMap,
      });

      if (resp.result === "follow_next_url") {
        // Load the URL in a browser for the user to complete any further action required.
        loadUrl(resp.next_url);
      }
    }
    break;
  case ApprovalResponseStatus.rejected:
    const res = approvalResponse as TransactionRejected
    // Notify user of the rejection
    showUser(res.error);
    break;
  default:
  // There was an error
}
```
