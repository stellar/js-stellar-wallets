import axios from "axios";
import sinon from "sinon";
import { Config } from "stellar-sdk";
import { getApprovalServerUrl } from "./getApprovalServerUrl";

describe("getApprovalServerUrl", () => {
  let axiosMock: sinon.SinonMock;

  beforeEach(() => {
    axiosMock = sinon.mock(axios);
    Config.setDefault();
  });

  afterEach(() => {
    axiosMock.verify();
    axiosMock.restore();
  });

  test("Issuer's Home Domain missing", async () => {
    try {
      // @ts-ignore
      const res = await getApprovalServerUrl({
        asset_code: "USD",
        asset_issuer:
          "GDBMMVJKWGT2N6HZ2BGMFHKODASVFYIHL2VS3RUTB3B3QES2R6YFXGQW",
      });
      expect("This test failed").toBe(null);
    } catch (e) {
      expect((e as any).toString()).toMatch(
        `Error: Issuer's home domain is missing`,
      );
    }
  });

  test("stellar.toml CURRENCIES missing", async () => {
    const homeDomain = "example.com";
    axiosMock
      .expects("get")
      .withArgs(sinon.match(`https://${homeDomain}/.well-known/stellar.toml`))
      .returns(
        Promise.resolve({
          data: "",
        }),
      );

    try {
      // @ts-ignore
      const res = await getApprovalServerUrl({
        asset_code: "USD",
        asset_issuer:
          "GDBMMVJKWGT2N6HZ2BGMFHKODASVFYIHL2VS3RUTB3B3QES2R6YFXGQW",
        home_domain: homeDomain,
      });
      expect("This test failed").toBe(null);
    } catch (e) {
      expect((e as any).toString()).toMatch(
        `Error: stellar.toml at ${homeDomain} does not contain CURRENCIES` +
          ` field`,
      );
    }
  });

  test("stellar.toml approval_server missing", async () => {
    const homeDomain = "example.com";
    axiosMock
      .expects("get")
      .withArgs(sinon.match(`https://${homeDomain}/.well-known/stellar.toml`))
      .returns(
        Promise.resolve({
          data: `
[[CURRENCIES]]
code = "USD"
issuer = "GDBMMVJKWGT2N6HZ2BGMFHKODASVFYIHL2VS3RUTB3B3QES2R6YFXGQW"
`,
        }),
      );

    try {
      // @ts-ignore
      const res = await getApprovalServerUrl({
        asset_code: "USD",
        asset_issuer:
          "GDBMMVJKWGT2N6HZ2BGMFHKODASVFYIHL2VS3RUTB3B3QES2R6YFXGQW",
        home_domain: homeDomain,
      });
      expect("This test failed").toBe(null);
    } catch (e) {
      expect((e as any).toString()).toMatch(
        `Error: stellar.toml at ${homeDomain} does not contain` +
          ` approval_server information for this asset`,
      );
    }
  });

  test("stellar.toml asset not found", async () => {
    const homeDomain = "example.com";
    axiosMock
      .expects("get")
      .withArgs(sinon.match(`https://${homeDomain}/.well-known/stellar.toml`))
      .returns(
        Promise.resolve({
          data: `
[[CURRENCIES]]
code = "USD"
issuer = "GDBMMVJKWGT2N6HZ2BGMFHKODASVFYIHL2VS3RUTB3B3QES2R6YFXGQW"
`,
        }),
      );

    try {
      // @ts-ignore
      const res = await getApprovalServerUrl({
        asset_code: "EUR",
        asset_issuer:
          "GDBMMVJKWGT2N6HZ2BGMFHKODASVFYIHL2VS3RUTB3B3QES2R6YFXGQW",
        home_domain: homeDomain,
      });
      expect("This test failed").toBe(null);
    } catch (e) {
      expect((e as any).toString()).toMatch(
        `Error: CURRENCY EUR:` +
          `GDBMMVJKWGT2N6HZ2BGMFHKODASVFYIHL2VS3RUTB3B3QES2R6YFXGQW` +
          ` not found on stellar.toml at ${homeDomain}`,
      );
    }
  });

  test("approval server URL is returned", async () => {
    const homeDomain = "example.com";
    axiosMock
      .expects("get")
      .withArgs(sinon.match(`https://${homeDomain}/.well-known/stellar.toml`))
      .returns(
        Promise.resolve({
          data: `
[[CURRENCIES]]
code = "USD"
issuer = "GDBMMVJKWGT2N6HZ2BGMFHKODASVFYIHL2VS3RUTB3B3QES2R6YFXGQW"
approval_server = "https://example.com/approve"
`,
        }),
      );

    try {
      const res = await getApprovalServerUrl({
        asset_code: "USD",
        asset_issuer:
          "GDBMMVJKWGT2N6HZ2BGMFHKODASVFYIHL2VS3RUTB3B3QES2R6YFXGQW",
        home_domain: homeDomain,
      });
      expect(res).toEqual("https://example.com/approve");
    } catch (e) {
      expect(e).toBe(null);
    }
  });
});
