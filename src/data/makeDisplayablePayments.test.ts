import BigNumber from "bignumber.js";

import { Payments } from "../fixtures/PaymentsResponse";
import { parseResponse } from "../testUtils";
import { makeDisplayablePayments } from "./makeDisplayablePayments";

it("Makes payments", () => {
  const paymentResponse = parseResponse(Payments);
  const payments = makeDisplayablePayments(
    { publicKey: "PHYREXIA" },
    paymentResponse.records,
  );

  expect(payments[0].id).toEqual("74305992237531137");
  expect(payments[0].amount).toEqual(new BigNumber("1000"));
  expect(payments[0].isInitialFunding).toEqual(true);
  expect(payments[0].isRecipient).toEqual(true);
  expect(payments[0].otherAccount.publicKey).toEqual("SERRA");

  expect(payments[1].id).toEqual("74961434311663617");
  expect(payments[1].amount).toEqual(new BigNumber("10"));
  expect(payments[1].token.code).toEqual("XLM");
  expect(payments[1].sourceToken).toEqual({ code: "XLM", type: "native" });
  expect(payments[1].isInitialFunding).toEqual(false);
  expect(payments[1].isRecipient).toEqual(true);
  expect(payments[1].otherAccount.publicKey).toEqual("SERRA");

  expect(payments[3].id).toEqual("95518827122688002");
  expect(payments[3].amount).toEqual(new BigNumber("0.0000300"));
  expect(payments[3].token.code).toEqual("XLM");
  expect(payments[3].isInitialFunding).toEqual(false);
  expect(payments[3].isRecipient).toEqual(true);
  expect(payments[3].otherAccount.publicKey).toEqual(
    "GDM4UWTGHCWSTM7Z46PNF4BLH35GS6IUZYBWNNI4VU5KVIHYSIVQ55Y6",
  );
});
