import { TransferResponseType } from "../constants/transfers";
import { getKycUrl, KycUrlParams } from "./getKycUrl";

function getParams(url: string, callback_url?: string): KycUrlParams {
  return {
    request: {
      amount: "2000",
      asset_code: "test",
    },
    response: {
      type: TransferResponseType.interactive_customer_info_needed,
      url,
      id: "116",
      interactive_deposit: true,
    },
    callback_url,
  };
}

test("works properly on simple urls", () => {
  expect(getKycUrl(getParams("https://www.google.com", "postMessage"))).toEqual(
    "https://www.google.com/?callback=postMessage",
  );
});

test("works properly on urls with directories", () => {
  expect(
    getKycUrl(getParams("https://www.google.com/mail", "postMessage")),
  ).toEqual("https://www.google.com/mail?callback=postMessage");
});

test("works properly on urls with querystrings", () => {
  expect(
    getKycUrl(getParams("https://www.google.com?good=true", "postMessage")),
  ).toEqual("https://www.google.com/?good=true&callback=postMessage");
});

test("works properly on urls with querystrings and hashes", () => {
  expect(
    getKycUrl(
      getParams("https://www.google.com/?good=true#page=1", "postMessage"),
    ),
  ).toEqual("https://www.google.com/?good=true&callback=postMessage#page=1");
});

test("works properly on urls with everything", () => {
  expect(
    getKycUrl(
      getParams(
        "https://www.google.com/mail/one?good=true#page=1",
        "postMessage",
      ),
    ),
  ).toEqual(
    "https://www.google.com/mail/one?good=true&callback=postMessage#page=1",
  );
});

test("callback not needed", () => {
  expect(
    getKycUrl(getParams("https://www.google.com/mail/one?good=true#page=1")),
  ).toEqual("https://www.google.com/mail/one?good=true#page=1");
});
