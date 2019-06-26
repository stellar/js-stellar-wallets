import { parseInfo } from "./parseInfo";

import {
  AnchorUSDTransferInfo,
  ApayTransferInfo,
} from "../fixtures/TransferInfoResponse";

it("AnchorUSD: runs without error", () => {
  parseInfo(AnchorUSDTransferInfo);
});

it("Apay: runs without error", () => {
  parseInfo(ApayTransferInfo);
});
