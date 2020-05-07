import BigNumber from "bignumber.js";
import { AssetType } from "stellar-base";
import { ServerApi } from "stellar-sdk";

import { Account, Payment, Token } from "../types";

function isCreateAccount(
  obj: any,
): obj is ServerApi.CreateAccountOperationRecord {
  return obj.type === "create_account";
}

function isAccountMerge(
  obj: any,
): obj is ServerApi.AccountMergeOperationRecord {
  return obj.type === "account_merge";
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

async function getAccountMergePaymentAmount(
  payment: ServerApi.AccountMergeOperationRecord,
  publicKey: string,
): Promise<string | undefined> {
  try {
    const effects = await payment.effects();
    const accountMergePayment = effects.records.find(
      (record) =>
        record.type === "account_credited" && record.account === publicKey,
    );

    if (accountMergePayment) {
      return accountMergePayment.amount;
    }

    return undefined;
  } catch (e) {
    return undefined;
  }
}

export async function makeDisplayablePayments(
  subjectAccount: Account,
  payments: Array<
    | ServerApi.CreateAccountOperationRecord
    | ServerApi.PaymentOperationRecord
    | ServerApi.PathPaymentOperationRecord
  >,
): Promise<Payment[]> {
  return Promise.all(
    payments.map(
      async (
        payment:
          | ServerApi.CreateAccountOperationRecord
          | ServerApi.PaymentOperationRecord
          | ServerApi.PathPaymentOperationRecord,
      ): Promise<Payment> => {
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

        // "account_merge" record does not have "amount" property
        let accountMergePaymentAmount;

        if (isAccountMerge(payment)) {
          accountMergePaymentAmount = await getAccountMergePaymentAmount(
            payment,
            subjectAccount.publicKey,
          );
        }

        let transaction: ServerApi.TransactionRecord | undefined;
        try {
          transaction = await payment.transaction();
        } catch (e) {
          // do nothing
        }

        return {
          id: payment.id,
          isInitialFunding: isCreateAccount(payment),
          isRecipient,
          token,
          amount: new BigNumber(
            isCreateAccount(payment)
              ? payment.starting_balance
              : accountMergePaymentAmount || payment.amount,
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
          ...(transaction
            ? {
                memo: transaction.memo,
                memoType: transaction.memo_type,
              }
            : {}),
        };
      },
    ),
  );
}
