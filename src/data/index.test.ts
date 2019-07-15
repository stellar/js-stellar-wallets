import { Asset } from "stellar-sdk";
import { getStellarSdkAsset, getTokenIdentifier } from "./";

describe("getTokenIdentifier", () => {
  test("native element", () => {
    expect(getTokenIdentifier({ type: "native", code: "XLM" })).toEqual(
      "native",
    );
  });
  test("non-native element", () => {
    expect(
      getTokenIdentifier({
        code: "BAT",
        type: "credit_alphanum4",
        issuer: {
          key: "GBDEVU63Y6NTHJQQZIKVTC23NWLQVP3WJ2RI2OTSJTNYOIGICST6DUXR",
        },
      }),
    ).toEqual("BAT:GBDEVU63Y6NTHJQQZIKVTC23NWLQVP3WJ2RI2OTSJTNYOIGICST6DUXR");
  });
});

describe("getStellarSdkAsset", () => {
  test("native element", () => {
    expect(getStellarSdkAsset({ type: "native", code: "XLM" })).toEqual(
      Asset.native(),
    );
  });
  test("normal element", () => {
    expect(
      getStellarSdkAsset({
        code: "BAT",
        type: "credit_alphanum4",
        issuer: {
          key: "GBDEVU63Y6NTHJQQZIKVTC23NWLQVP3WJ2RI2OTSJTNYOIGICST6DUXR",
        },
      }),
    ).toEqual(
      new Asset(
        "BAT",
        "GBDEVU63Y6NTHJQQZIKVTC23NWLQVP3WJ2RI2OTSJTNYOIGICST6DUXR",
      ),
    );
  });
});
