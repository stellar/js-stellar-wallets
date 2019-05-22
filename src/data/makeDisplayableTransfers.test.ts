import BigNumber from "bignumber.js";

import { Payments } from "../fixtures/PaymentsResponse";
import { parseResponse } from "../testUtils";
import { makeDisplayableTransfers } from "./makeDisplayableTransfers";

it("Makes transfers", () => {
  const transferResponse = parseResponse(Payments);
  const transfers = makeDisplayableTransfers(
    { publicKey: "PHYREXIA" },
    transferResponse.records,
  );

  expect(transfers[0].id).toEqual("74305992237531137");
  expect(transfers[0].amount).toEqual(new BigNumber("1000"));
  expect(transfers[0].isInitialFunding).toEqual(true);
  expect(transfers[0].isRecipient).toEqual(true);
  expect(transfers[0].otherAccount.publicKey).toEqual("SERRA");

  expect(transfers[1].id).toEqual("74961434311663617");
  expect(transfers[1].amount).toEqual(new BigNumber("10"));
  expect(transfers[1].token.code).toEqual("XLM");
  expect(transfers[1].sourceToken).toEqual({ code: "XLM", type: "native" });
  expect(transfers[1].isInitialFunding).toEqual(false);
  expect(transfers[1].isRecipient).toEqual(true);
  expect(transfers[1].otherAccount.publicKey).toEqual("SERRA");

  expect(transfers[3].id).toEqual("95518827122688002");
  expect(transfers[3].amount).toEqual(new BigNumber("0.0000300"));
  expect(transfers[3].token.code).toEqual("XLM");
  expect(transfers[3].isInitialFunding).toEqual(false);
  expect(transfers[3].isRecipient).toEqual(true);
  expect(transfers[3].otherAccount.publicKey).toEqual(
    "GDM4UWTGHCWSTM7Z46PNF4BLH35GS6IUZYBWNNI4VU5KVIHYSIVQ55Y6",
  );
});
