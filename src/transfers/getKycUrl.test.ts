import { TransferResponseType } from "../constants/transfers";
import { getKycUrl } from "./getKycUrl";

test("works properly on simple urls", () => {
  expect(
    getKycUrl({
      request: {
        amount: "2000",
        asset_code: "test",
      },
      response: {
        type: TransferResponseType.interactive_customer_info_needed,
        url: "https://www.google.com",
        id: "116",
        interactive_deposit: true,
      },
      callback_url: "postMessage",
    }),
  ).toEqual("https://www.google.com/?callback=postMessage");
});

test("works properly on urls with directories", () => {
  expect(
    getKycUrl({
      request: {
        amount: "2000",
        asset_code: "test",
      },
      response: {
        type: TransferResponseType.interactive_customer_info_needed,
        url: "https://www.google.com/mail",
        id: "116",
        interactive_deposit: true,
      },
      callback_url: "postMessage",
    }),
  ).toEqual("https://www.google.com/mail?callback=postMessage");
});

test("works properly on urls with querystrings", () => {
  expect(
    getKycUrl({
      request: {
        amount: "2000",
        asset_code: "test",
      },
      response: {
        type: TransferResponseType.interactive_customer_info_needed,
        url: "https://www.google.com/?good=true",
        id: "116",
        interactive_deposit: true,
      },
      callback_url: "postMessage",
    }),
  ).toEqual("https://www.google.com/?good=true&callback=postMessage");
});

test("works properly on urls with querystrings and hashes", () => {
  expect(
    getKycUrl({
      request: {
        amount: "2000",
        asset_code: "test",
      },
      response: {
        type: TransferResponseType.interactive_customer_info_needed,
        url: "https://www.google.com/?good=true#page=1",
        id: "116",
        interactive_deposit: true,
      },
      callback_url: "postMessage",
    }),
  ).toEqual("https://www.google.com/?good=true&callback=postMessage#page=1");
});

test("works properly on urls with everything", () => {
  expect(
    getKycUrl({
      request: {
        amount: "2000",
        asset_code: "test",
      },
      response: {
        type: TransferResponseType.interactive_customer_info_needed,
        url: "https://www.google.com/mail/one?good=true#page=1",
        id: "116",
        interactive_deposit: true,
      },
      callback_url: "postMessage",
    }),
  ).toEqual(
    "https://www.google.com/mail/one?good=true&callback=postMessage#page=1",
  );
});
