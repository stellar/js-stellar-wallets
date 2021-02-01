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
  fetchActionInBrowser: ({
    response: ActionRequired,
    window: Window,
  }) => Promise<ActionPromptStatus>;
}

type callActionUrl = (params: CallActionUrlRequest) => string;

interface CallActionUrlRequest {
  response: ActionRequired;
  callbackId: ApprovalRequest;
  callbackUrl: string;
}

// This is to be used as a query string for the callbackUrl.
interface ApprovalRequest {
  tx: string;
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
  checkRegulatedAssetInTx,
  getHomeDomainByAsset,
  getApprovalServerUrl,
  callActionUrl,
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
    if (isBrowser) {
      // To avoid popup blockers, the new window has to be opened directly in
      // response to a user click event, so we need consumers to provide us a
      // window instance that they created previously. This could also be done in
      // an iframe or something.
      const popup = window.open("", "name", "dimensions etc");

      const actionResult = await approvalProvider.fetchActionInBrowser({
        response: approvalResponse,
        window: popup,
      });

      showUser(actionResult);

      // if action succeeded, submit transaction
      if (actionResult.status === "success") {
        transaction = new Transaction(actionResult.tx);
        submitPayment(transaction);
      }
    } else if (isServerEnv || isNativeEnv) {
      const actionRedirect = callActionUrl({
        response: approvalResponse,
        callbackId: approvalRequest,
        callbackUrl: callbackUrl,
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
