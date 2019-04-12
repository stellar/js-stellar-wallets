import {
  DepositInfo,
  Fee,
  Field,
  RawField,
  RawInfoResponse,
  RawType,
  SimpleFee,
  WithdrawInfo,
} from "../types";

export function parseInfo(info: RawInfoResponse) {
  const { fee, transactions, transaction } = info;
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
    (fee_fixed && Number(fee_fixed) > 0) ||
    (fee_percent && Number(fee_percent) > 0)
  ) {
    return {
      type: "simple",
      fixed: fee_fixed,
      percent: fee_percent,
    } as SimpleFee;
  } else {
    return {
      type: feeEnabled ? "complex" : "none",
    };
  }
};

function parseType([typeName, type]: [string, RawType]) {
  return {
    name: typeName,
    fields: Object.entries(type.fields).map(parseField),
  };
}

type FieldEntry = [string, RawField];

function parseField([fieldName, field]: FieldEntry): Field {
  return {
    ...field,
    name: fieldName,
  };
}

export function parseWithdraw(info: RawInfoResponse): WithdrawInfo {
  return Object.entries(info.withdraw).reduce(
    (accum, [assetCode, entry]) => {
      const fee = parseFee(entry, !!(info.fee && info.fee.enabled));

      accum[assetCode] = {
        assetCode,
        fee,
        minAmount: entry.min_amount,
        maxAmount: entry.max_amount,
        types: Object.entries(entry.types).map(parseType),
      };
      return accum;
    },
    {} as WithdrawInfo,
  );
}

export function parseDeposit(info: RawInfoResponse): DepositInfo {
  return Object.entries(info.deposit).reduce(
    (accum, [assetCode, entry]) => {
      const fee = parseFee(entry, !!(info.fee && info.fee.enabled));

      accum[assetCode] = {
        assetCode,
        fee,
        minAmount: entry.min_amount,
        maxAmount: entry.max_amount,
        fields: Object.entries(entry.fields).map(parseField),
      };
      return accum;
    },
    {} as DepositInfo,
  );
}
