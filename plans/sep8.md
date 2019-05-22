## SEP-8 regulated assets

Approval service API for transacting with an anchor's regulated assets.

The high-level flow is:

- User signs a transaction
- Parse transaction for assets involved, detect whether any assets involved are regulated
- If regulated, notify user submitting request for transaction approval
- Submit transaction to approval server, and depending on response:
  - if success
    - Display message if included in response
    - Submit approved tx to the network
  - if revised
    - Display message
    - Parse returned tx, display modifications to user
    - Prompt user to resign tx
    - Submit resigned tx to the network
  - if pending
    - Display timeout, message if included in response
  - if action required
    - Display message
    - Redirect to action url
  - if rejected
    - "approval failed"
    - Display error


### Types

```ts
type getActionUrl = (args: GetActionArgs) => string;

interface GetActionArgs {
  request: ApprovalRequest;
  response: ActionRequired;
  callbackUrl: string;
}

class ApprovalProvider {
  constructor(approvalServer, regulatedAssets) {}
  approve: (args: ApprovalRequest) => Promise<ApprovalResponse>;
  needsApproval: (args: Transaction) => boolean;
  fetchActionInBrowser: ({
    response: ActionRequired,
    window: Window,
  }) => Promise<ActionPromptStatus>;
}

interface ApprovalRequest {
  tx: string;
}

interface ApprovalResponse {
  status:
    | "success"
    | "revised"
    | "pending"
    | "action_required"
    | "rejected";
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
}

interface ActionPromptStatus extends ApprovalResponse {
  status: "success" | "rejected";
  tx: string;
}

interface TransactionRejected extends ApprovalResponse {
  status: "rejected";
  error: string;
}
```

### Usage

```js
import {
  ApprovalProvider,
  ApprovalResponseType,
  getActionUrl
} from "wallet-sdk";

// approvalServerUrl and regulatedAssets fetched from stellar.toml
// regulatedAssets is a map of `${asset.code}-${asset.issuer}` to 'stellar-base' Asset
const approvalProvider = new ApprovalProvider(approvalServerUrl, regulatedAssets);

// Parse transaction to check if involves regulated assets
const needsApproval = approvalProvider.needsApproval(transaction);
if (!needsApproval) {
  // No approval needed so submit to the network
  submitPayment(transaction);
  return;
}

// Notify user asking for approval
showUser(needsApproval);

// Deconstruct to transaction envelope then submit to approval server
// TODO: Maybe provider helper for deconstruct/reconstruct of tx <-> Transaction?
const tx = transaction.toEnvelope().toXDR().toString('base64');
const approvalResponse = await approvalProvider.approve({ tx });

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
    if (isBrowser) {
      // To avoid popup blockers, the new window has to be opened directly in
      // response to a user click event, so we need consumers to provide us a
      // window instance that they created previously. This could also be done in
      // an iframe or something.
      const popup = window.open("", "name", "dimensions etc");

      const actionResult = await approvalProvider.fetchActionInBrowser({
        response: approvalResult,
        window: popup,
      });

      showUser(actionResult);

      // if action succeeded, submit transaction
      if (actionResult.status === "success") {
        transaction = new Transaction(actionResult.tx);
        submitPayment(transaction);  
      }
    } else if (isServerEnv || isNativeEnv) {
      const actionRedirect = getActionUrl({
        result: approvalResult,
        request: approvalRequest,
        callbackUrl,
      });
      /**
      * On e.g. react native, the client will have to open a webview manually
      * and pass a callback URL that the app has "claimed." This is very similar
      * to e.g. OAuth flows.
      * https://www.oauth.com/oauth2-servers/redirect-uris/redirect-uris-native-apps/
      * Include the original request so it can be provided as a querystring to
      * the callback URL.
      */
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
