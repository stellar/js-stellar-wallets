// github.com/trezor/connect/blob/develop/src/js/plugins/stellar/plugin.js
import BigNumber from "bignumber.js";
import StellarSdk, { Asset, MemoType, MemoValue } from "stellar-sdk";

const transformSigner = (signer: {
  ed25519PublicKey?: string;
  sha256Hash?: string | Buffer;
  preAuthTx?: string | Buffer;
  weight?: number | string;
}) => {
  let type = 0;
  let key;
  const weight = signer.weight;

  if (typeof signer.ed25519PublicKey === "string") {
    const keyPair = StellarSdk.Keypair.fromPublicKey(signer.ed25519PublicKey);
    key = keyPair.rawPublicKey().toString("hex");
  }

  if (signer.preAuthTx instanceof Buffer) {
    type = 1;
    key = signer.preAuthTx.toString("hex");
  }

  if (signer.sha256Hash instanceof Buffer) {
    type = 2;
    key = signer.sha256Hash.toString("hex");
  }

  return {
    type,
    key,
    weight,
  };
};

const transformAsset = (asset: Asset) => {
  if (asset.isNative()) {
    return {
      type: 0,
      code: asset.getCode(),
    };
  }

  return {
    type: asset.getAssetType() === "credit_alphanum4" ? 1 : 2,
    code: asset.getCode(),
    issuer: asset.getIssuer(),
  };
};

const transformAmount = (amount: string) =>
  new BigNumber(amount).times(10000000).toString();

const transformType = (type: any) => {
  switch (type) {
    case "pathPaymentStrictReceive":
      return "pathPayment";
    case "createPassiveSellOffer":
      return "createPassiveOffer";
    case "manageSellOffer":
      return "manageOffer";
    default:
      return type;
  }
};

const transformMemo = (memo: { type: MemoType; value: MemoValue }) => {
  switch (memo.type) {
    case StellarSdk.MemoText:
      return { type: 1, text: memo.value };
    case StellarSdk.MemoID:
      return { type: 2, id: memo.value };
    case StellarSdk.MemoHash:
      // stringify is not necessary, Buffer is also accepted
      return { type: 3, hash: memo.value ? memo.value.toString("hex") : "" };
    case StellarSdk.MemoReturn:
      // stringify is not necessary, Buffer is also accepted
      return { type: 4, hash: memo.value ? memo.value.toString("hex") : "" };
    default:
      return { type: 0 };
  }
};

const transformTimebounds = (
  timebounds:
    | {
        minTime: string;
        maxTime: string;
      }
    | undefined,
) => {
  if (!timebounds) {
    return undefined;
  }
  // those values are defined in Trezor firmware messages as numbers
  return {
    minTime: Number.parseInt(timebounds.minTime, 10),
    maxTime: Number.parseInt(timebounds.maxTime, 10),
  };
};

export const transformTransaction = (path: string, transaction: any) => {
  const amounts = [
    "amount",
    "sendMax",
    "destAmount",
    "startingBalance",
    "limit",
  ];
  const assets = [
    "asset",
    "sendAsset",
    "destAsset",
    "selling",
    "buying",
    "line",
  ];

  const operations = transaction.operations.map((o: any, i: number) => {
    const operation: any = { ...o };

    // transform StellarSdk.Signer
    if (operation.signer) {
      operation.signer = transformSigner(operation.signer);
    }

    // transform asset path
    if (operation.path) {
      operation.path = operation.path.map(transformAsset);
    }

    // transform "price" field to { n: number, d: number }
    if (typeof operation.price === "string") {
      const xdrOperation = transaction.tx.operations()[i];
      operation.price = {
        n: xdrOperation
          .body()
          .value()
          .price()
          .n(),
        d: xdrOperation
          .body()
          .value()
          .price()
          .d(),
      };
    }

    // transform amounts
    amounts.forEach((field) => {
      if (typeof operation[field] === "string") {
        operation[field] = transformAmount(operation[field]);
      }
    });

    // transform assets
    assets.forEach((field) => {
      if (operation[field]) {
        operation[field] = transformAsset(operation[field]);
      }
    });

    // add missing field
    if (operation.type === "allowTrust") {
      const allowTrustAsset = new StellarSdk.Asset(
        operation.assetCode,
        operation.trustor,
      );
      operation.assetType = transformAsset(allowTrustAsset).type;
    }

    if (operation.type === "manageData" && operation.value) {
      // stringify is not necessary, Buffer is also accepted
      operation.value = operation.value.toString("hex");
    }

    // transform type
    operation.type = transformType(o.type);

    return operation;
  });

  return {
    path,
    networkPassphrase: transaction.networkPassphrase,
    transaction: {
      source: transaction.source,
      fee: Number(transaction.fee),
      sequence: transaction.sequence,
      memo: transformMemo(transaction.memo),
      timebounds: transformTimebounds(transaction.timeBounds),
      operations,
    },
  };
};
