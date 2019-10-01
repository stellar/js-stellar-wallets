export const AnchorUSDTransferInfo = {
  deposit: {
    USD: {
      enabled: true,
      fee_fixed: 5,
      fee_percent: 1,
      min_amount: 15,
      fields: {
        email_address: {
          description: "your email address for transaction status updates",
        },
        amount: { description: "amount in USD that you plan to deposit" },
      },
    },
  },
  withdraw: {
    USD: {
      enabled: true,
      fee_fixed: 5,
      fee_percent: 2,
      min_amount: 15,
      types: {
        bank_account: {
          fields: {
            account: {
              description:
                "the stellar account that you will be transferring funds from",
            },
            email_address: {
              description: "your email address for transaction status updates",
            },
            amount: {
              description: "amount in USD that you plan to withdraw",
              optional: true,
            },
          },
        },
      },
    },
  },
  transactions: { enabled: false },
};

export const ApayTransferInfo = {
  deposit: {
    BCH: { enabled: true, fee_fixed: 0, min_amount: 0.001 },
    BTC: { enabled: true, fee_fixed: 0, min_amount: 0.0002 },
    DASH: { enabled: false, fee_fixed: 0, min_amount: 0.003 },
    LTC: { enabled: true, fee_fixed: 0, min_amount: 0.01 },
    ETH: { enabled: true, fee_fixed: 0, min_amount: 0.001 },
    BAT: { enabled: true, fee_fixed: 0, min_amount: 2 },
    KIN: { enabled: true, fee_fixed: 0, min_amount: 0 },
    LINK: { enabled: true, fee_fixed: 0, min_amount: 2 },
    MTL: { enabled: true, fee_fixed: 0, min_amount: 0.3 },
    OMG: { enabled: true, fee_fixed: 0, min_amount: 0.1 },
    REP: { enabled: true, fee_fixed: 0, min_amount: 0.02 },
    SALT: { enabled: true, fee_fixed: 0, min_amount: 0.5 },
    ZRX: { enabled: true, fee_fixed: 0, min_amount: 0.5 },
  },
  withdraw: {
    BCH: {
      enabled: true,
      fee_fixed: 0.002,
      min_amount: 0.004,
      types: { crypto: {} },
    },
    BTC: {
      enabled: true,
      fee_fixed: 0.0005,
      min_amount: 0.001,
      types: { crypto: {} },
    },
    DASH: {
      enabled: false,
      fee_fixed: 0.006,
      min_amount: 0.012,
      types: { crypto: {} },
    },
    LTC: {
      enabled: true,
      fee_fixed: 0.025,
      min_amount: 0.05,
      types: { crypto: {} },
    },
    ETH: {
      enabled: true,
      fee_fixed: 0.005,
      min_amount: 0.01,
      types: { crypto: {} },
    },
    BAT: { enabled: true, fee_fixed: 5, min_amount: 10, types: { crypto: {} } },
    KIN: {
      enabled: true,
      fee_fixed: 10000,
      min_amount: 20000,
      types: { crypto: {} },
    },
    LINK: {
      enabled: true,
      fee_fixed: 5,
      min_amount: 10,
      types: { crypto: {} },
    },
    MTL: {
      enabled: true,
      fee_fixed: 0.5,
      min_amount: 1,
      types: { crypto: {} },
    },
    OMG: {
      enabled: true,
      fee_fixed: 0.2,
      min_amount: 0.4,
      types: { crypto: {} },
    },
    REP: {
      enabled: true,
      fee_fixed: 0.05,
      min_amount: 0.1,
      types: { crypto: {} },
    },
    SALT: { enabled: true, fee_fixed: 1, min_amount: 2, types: { crypto: {} } },
    ZRX: { enabled: true, fee_fixed: 2, min_amount: 4, types: { crypto: {} } },
  },
  transactions: { enabled: false },
};

export const SMXTransferInfo = {
  deposit: {
    SMX: {
      enabled: true,
      fee_fixed: 0,
      fee_percent: 0,
      min_amount: 1500,
      max_amount: 1000000,
      fields: {
        email_address: {
          description: "your email address for transaction status updates",
          optional: true,
        },
        amount: { description: "amount in cents that you plan to deposit" },
        type: {
          description: "type of deposit to make",
          choices: ["SPEI", "cash"],
        },
      },
    },
  },
  withdraw: {
    SMX: {
      enabled: true,
      fee_fixed: 0,
      fee_percent: 0,
      min_amount: 0.1,
      max_amount: 1000000,
      types: {
        bank_account: {
          fields: { dest: { description: "your bank account number" } },
        },
      },
    },
  },
  fee: { enabled: false },
  transactions: { enabled: true },
  transaction: { enabled: true },
};
