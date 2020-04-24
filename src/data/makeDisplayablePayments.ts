import BigNumber from "bignumber.js";
import { AssetType } from "stellar-base";
import { ServerApi } from "stellar-sdk";

import { Account, Payment, Token } from "../types";

function isCreateAccount(
  obj: any,
): obj is ServerApi.CreateAccountOperationRecord {
  return obj.type === "create_account";
}

function isPathPayment(obj: any): obj is ServerApi.PathPaymentOperationRecord {
  return (
    // old, soon-to-be-deprecated name
    obj.type === "path_payment" ||
    // new names
    obj.type === "path_payment_strict_send" ||
    obj.type === "path_payment_strict_receive"
  );
}

export function makeDisplayablePayments(
  subjectAccount: Account,
  payments: Array<
    | ServerApi.CreateAccountOperationRecord
    | ServerApi.PaymentOperationRecord
    | ServerApi.PathPaymentOperationRecord
  >,
): Payment[] {
  return payments.map(
    (
      payment:
        | ServerApi.CreateAccountOperationRecord
        | ServerApi.PaymentOperationRecord
        | ServerApi.PathPaymentOperationRecord,
    ): Payment => {
      const isRecipient = payment.source_account !== subjectAccount.publicKey;

      let otherAccount: Account;

      if (isCreateAccount(payment)) {
        otherAccount = {
          publicKey: isRecipient
            ? payment.source_account
            : payment.source_account,
        };
      } else {
        otherAccount = { publicKey: isRecipient ? payment.from : payment.to };
      }

      const token: Token = isCreateAccount(payment)
        ? {
            type: "native" as AssetType,
            code: "XLM",
          }
        : {
            type: payment.asset_type as AssetType,
            code: payment.asset_code || "XLM",
            issuer:
              payment.asset_type === "native"
                ? undefined
                : {
                    key: payment.asset_issuer as string,
                  },
          };

      return {
        id: payment.id,
        isInitialFunding: isCreateAccount(payment),
        isRecipient,
        token,
        amount: new BigNumber(
          isCreateAccount(payment) ? payment.starting_balance : payment.amount,
        ),
        timestamp: Math.floor(new Date(payment.created_at).getTime() / 1000),
        otherAccount,
        sourceToken: isPathPayment(payment)
          ? {
              type: payment.source_asset_type as AssetType,
              code: payment.source_asset_code || "XLM",
              issuer:
                payment.source_asset_type === "native"
                  ? undefined
                  : {
                      key: payment.source_asset_issuer as string,
                    },
            }
          : undefined,
        sourceAmount: isPathPayment(payment)
          ? new BigNumber(payment.source_amount)
          : undefined,
        transactionId: payment.transaction_hash,
        // TODO: remove these when stellar-sdk is updated
        // @ts-ignore
        ...(payment.transaction_attr
          ? {
              // @ts-ignore
              memo: payment.transaction_attr.memo,
              // @ts-ignore
              memoType: payment.transaction_attr.memo_type,
            }
          : {}),
      };
    },
  );
}
