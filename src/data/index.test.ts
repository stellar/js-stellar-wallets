import { getTokenIdentifier } from "./";

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
