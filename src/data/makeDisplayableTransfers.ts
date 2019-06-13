import BigNumber from "bignumber.js";
import { AssetType } from "stellar-base";
import { ServerApi } from "stellar-sdk";

import { Account, Token, Transfer } from "../types";

/*
  {
    _links: {
      self: {
        href: "https://horizon.stellar.org/operations/95868428870524946",
      },
      transaction: {
        href:
          "https://horizon.stellar.org/transactions/
          94fb9af4bb31778d341bb36ef07271e55ec17aed1c7a52bd61a8a8d6a08e914d",
      },
      effects: {
        href:
          "https://horizon.stellar.org/operations/95868428870524946/effects",
      },
      succeeds: {
        href:
          "https://horizon.stellar.org/effects?order=desc\u0026cursor=95868428870524946",
      },
      precedes: {
        href:
          "https://horizon.stellar.org/effects?order=asc\u0026cursor=95868428870524946",
      },
    },
    id: "95868428870524946",
    paging_token: "95868428870524946",
    transaction_successful: true,
    source_account:
      "GCCD6AJOYZCUAQLX32ZJF2MKFFAUJ53PVCFQI3RHWKL3V47QYE2BNAUT",
    type: "payment",
    type_i: 1,
    created_at: "2019-02-05T00:36:47Z",
    transaction_hash:
      "94fb9af4bb31778d341bb36ef07271e55ec17aed1c7a52bd61a8a8d6a08e914d",
    asset_type: "native",
    from: "GCCD6AJOYZCUAQLX32ZJF2MKFFAUJ53PVCFQI3RHWKL3V47QYE2BNAUT",
    to: "PHYREXIA",
    amount: "0.2032944",
  },
*/

function isCreateAccount(
  obj: any,
): obj is ServerApi.CreateAccountOperationRecord {
  return obj.type === "create_account";
}

function isPathPayment(obj: any): obj is ServerApi.PathPaymentOperationRecord {
  return obj.type === "path_payment";
}

export function makeDisplayableTransfers(
  subjectAccount: Account,
  payments: Array<
    | ServerApi.CreateAccountOperationRecord
    | ServerApi.PaymentOperationRecord
    | ServerApi.PathPaymentOperationRecord
  >,
): Transfer[] {
  return payments.map(
    (
      payment:
        | ServerApi.CreateAccountOperationRecord
        | ServerApi.PaymentOperationRecord
        | ServerApi.PathPaymentOperationRecord,
    ): Transfer => {
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
                    key: payment.asset_issuer,
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
                      key: payment.source_asset_issuer,
                    },
            }
          : undefined,
        sourceAmount: isPathPayment(payment)
          ? new BigNumber(payment.source_amount)
          : undefined,
      };
    },
  );
}
