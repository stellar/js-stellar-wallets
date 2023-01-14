import { Asset, Operation, Server, Transaction } from "stellar-sdk";
import { RegulatedAssetInfo } from "../types/sep8";

export async function getRegulatedAssetsInTx(
  tx: Transaction,
  horizonUrl: string,
): Promise<RegulatedAssetInfo[]> {
  const res: RegulatedAssetInfo[] = [];
  const server = new Server(horizonUrl);
  for (const op of tx.operations) {
    if (!isOpMovingAsset(op)) {
      continue;
    }
    const assets = await getAssetsFromOp(op, server);
    if (!assets.length) {
      throw new Error(`Couldn't get asset(s) in operation ${op.type}`);
    }

    for (const ast of assets) {
      try {
        const accountDetail = await server.loadAccount(ast.getIssuer());
        if (
          accountDetail.flags.auth_required &&
          accountDetail.flags.auth_revocable
        ) {
          res.push({
            asset_code: ast.getCode(),
            asset_issuer: ast.getIssuer(),
            home_domain: accountDetail.home_domain,
          });
        }
      } catch (e: any) {
        throw new Error(
          `Couldn't get asset issuer information ${ast.getIssuer()}` +
            ` in operation ${op.type} from ${horizonUrl}: ${e.toString()}`,
        );
      }
    }
  }

  return res;
}

function isOpMovingAsset(op: Operation): boolean {
  return [
    "payment",
    "pathPaymentStrictReceive",
    "pathPaymentStrictSend",
    "createPassiveSellOffer",
    "manageSellOffer",
    "manageBuyOffer",
    "createClaimableBalance",
    "claimClaimableBalance",
  ].includes(op.type);
}

async function getAssetsFromOp(
  op: Operation,
  server: Server,
): Promise<Asset[]> {
  switch (op.type) {
    case "payment":
      return [op.asset];
    case "pathPaymentStrictReceive":
      return [op.sendAsset, op.destAsset];
    case "pathPaymentStrictSend":
      return [op.sendAsset, op.destAsset];
    case "createPassiveSellOffer":
      return [op.selling, op.buying];
    case "manageSellOffer":
      return [op.selling, op.buying];
    case "manageBuyOffer":
      return [op.selling, op.buying];
    case "createClaimableBalance":
      return [op.asset];
    case "claimClaimableBalance":
      try {
        const cBalance = await server
          .claimableBalances()
          .claimableBalance(op.balanceId)
          .call();

        const [code, issuer] = cBalance.asset.split(":", 2);
        return [new Asset(code, issuer)];
      } catch (e) {
        throw new Error(
          `Error getting claimbable balance with id ${
            op.balanceId
          } from: ${server.serverURL.toString()}`,
        );
      }
    default:
      return [];
  }
}
