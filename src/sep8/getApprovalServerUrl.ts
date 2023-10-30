import { StellarToml } from "stellar-sdk";
import { RegulatedAssetInfo } from "../types/sep8";

export async function getApprovalServerUrl(
  param: RegulatedAssetInfo,
  opts: StellarToml.Api.StellarTomlResolveOptions = {},
): Promise<string> {
  if (!param.home_domain) {
    throw new Error(`Issuer's home domain is missing`);
  }

  const tomlObject = await StellarToml.Resolver.resolve(
    param.home_domain,
    opts,
  );
  if (!tomlObject.CURRENCIES) {
    throw new Error(
      `stellar.toml at ${param.home_domain} does not contain CURRENCIES field`,
    );
  }

  for (const ast of tomlObject.CURRENCIES) {
    if (ast.code === param.asset_code && ast.issuer === param.asset_issuer) {
      if (!ast.approval_server) {
        throw new Error(
          `stellar.toml at ${
            param.home_domain
          } does not contain approval_server information for this asset`,
        );
      }

      return ast.approval_server;
    }
  }

  throw new Error(
    `CURRENCY ${param.asset_code}:${
      param.asset_issuer
    } not found on stellar.toml at ${param.home_domain}`,
  );
}
