import { generatePlaintextKey } from "../fixtures/keys";
import { DataProvider } from "./DataProvider";

describe("Account validation", () => {
  test("works with real public keys", () => {
    try {
      const provider = new DataProvider({
        accountOrKey:
          "GDZBHQFIHLVDF6GCRV5DT2STB6ZXAJR3JFGZNXNPLB35TH5GNMUVIAQP",
        serverUrl: "https://horizon.stellar.org",
      });
      expect(provider).toBeInstanceOf(DataProvider);
    } catch (e) {
      expect(e).toBeUndefined();
    }
  });

  test("works with real typed Keys", () => {
    try {
      const provider = new DataProvider({
        accountOrKey: generatePlaintextKey(),
        serverUrl: "https://horizon.stellar.org",
      });
      expect(provider).toBeInstanceOf(DataProvider);
    } catch (e) {
      expect(e).toBeUndefined();
    }
  });

  test("Throw with bad key", () => {
    let provider;
    try {
      provider = new DataProvider({
        accountOrKey: "I am not a stupid key you dumbdumb",
        serverUrl: "https://horizon.stellar.org",
      });
    } catch (e) {
      console.log("error: ", e);
      expect(e).toBeTruthy();
      expect(e.isUnfunded).toBeFalsy();
    }
    expect(provider).not.toBeInstanceOf(DataProvider);
  });
});
