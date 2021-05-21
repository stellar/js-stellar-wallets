import {
  DepositAssetInfoMap,
  Fee,
  Field,
  RawField,
  RawInfoResponse,
  RawType,
  SimpleFee,
  WithdrawAssetInfoMap,
} from "../types";

function isValidInfoResponse(obj: any): obj is RawInfoResponse {
  return (
    (obj as RawInfoResponse).withdraw !== undefined &&
    (obj as RawInfoResponse).deposit !== undefined
  );
}

export function parseInfo(info: any) {
  if (!isValidInfoResponse(info)) {
    throw new Error("The endpoint didn't return a valid info response!");
  }
  const { fee, transactions, transaction } = info as RawInfoResponse;
  return {
    withdraw: parseWithdraw(info),
    deposit: parseDeposit(info),
    fee,
    transactions,
    transaction,
  };
}

const parseFee = (
  {
    fee_fixed,
    fee_percent,
  }: {
    fee_fixed: number;
    fee_percent: number;
  },
  feeEnabled: boolean,
): Fee => {
  if (
    (fee_fixed && Number(fee_fixed) >= 0) ||
    (fee_percent && Number(fee_percent) >= 0)
  ) {
    return {
      type: "simple",
      fixed: fee_fixed,
      percent: fee_percent,
    } as SimpleFee;
  } else {
    return {
      type: feeEnabled ? "complex" : "none",
    } as Fee;
  }
};

function parseType([typeName, type]: [string, RawType]) {
  return {
    name: typeName,
    fields: Object.entries(type.fields || {}).map(parseField),
  };
}

type FieldEntry = [string, RawField];

function parseField([fieldName, field]: FieldEntry): Field {
  return {
    ...field,
    name: fieldName,
  };
}

export function parseWithdraw(info: RawInfoResponse): WithdrawAssetInfoMap {
  return Object.entries(info.withdraw).reduce(
    (accum, [asset_code, entry]) => {
      const fee = parseFee(entry, !!(info.fee && info.fee.enabled));

      accum[asset_code] = {
        asset_code,
        fee,
        min_amount: entry.min_amount,
        max_amount: entry.max_amount,
        authentication_required: !!entry.authentication_required,
        types: Object.entries(entry.types || {}).map(parseType),
      };
      return accum;
    },
    {} as WithdrawAssetInfoMap,
  );
}

export function parseDeposit(info: RawInfoResponse): DepositAssetInfoMap {
  return Object.entries(info.deposit).reduce(
    (accum, [asset_code, entry]) => {
      const fee = parseFee(entry, !!(info.fee && info.fee.enabled));

      accum[asset_code] = {
        asset_code,
        fee,
        min_amount: entry.min_amount,
        max_amount: entry.max_amount,
        authentication_required: !!entry.authentication_required,
        fields: Object.entries(entry.fields || {}).map(parseField),
      };
      return accum;
    },
    {} as DepositAssetInfoMap,
  );
}
