export const AccountResponse = {
  _links: {
    self: {
      href: "https://horizon.stellar.org/accounts/PHYREXIA",
    },
    transactions: {
      href:
        "https://horizon.stellar.org/accounts/PHYREXIA/transactions{?cursor,limit,order}",
      templated: true,
    },
    operations: {
      href:
        "https://horizon.stellar.org/accounts/PHYREXIA/operations{?cursor,limit,order}",
      templated: true,
    },
    payments: {
      href:
        "https://horizon.stellar.org/accounts/PHYREXIA/payments{?cursor,limit,order}",
      templated: true,
    },
    effects: {
      href:
        "https://horizon.stellar.org/accounts/PHYREXIA/effects{?cursor,limit,order}",
      templated: true,
    },
    offers: {
      href:
        "https://horizon.stellar.org/accounts/PHYREXIA/offers{?cursor,limit,order}",
      templated: true,
    },
    trades: {
      href:
        "https://horizon.stellar.org/accounts/PHYREXIA/trades{?cursor,limit,order}",
      templated: true,
    },
    data: {
      href: "https://horizon.stellar.org/accounts/PHYREXIA/data/{key}",
      templated: true,
    },
  },
  id: "PHYREXIA",
  paging_token: "",
  account_id: "PHYREXIA",
  sequence: "74305992237514793",
  subentry_count: 5,
  inflation_destination:
    "GCCD6AJOYZCUAQLX32ZJF2MKFFAUJ53PVCFQI3RHWKL3V47QYE2BNAUT",
  last_modified_ledger: 22997383,
  thresholds: {
    low_threshold: 0,
    med_threshold: 0,
    high_threshold: 0,
  },
  flags: {
    auth_required: false,
    auth_revocable: false,
    auth_immutable: false,
  },
  balances: [
    {
      balance: "0.0000000",
      limit: "922337203685.4775807",
      buying_liabilities: "0.0000000",
      selling_liabilities: "0.0000000",
      last_modified_ledger: 22897214,
      asset_type: "credit_alphanum4",
      asset_code: "BAT",
      asset_issuer: "GBDEVU63Y6NTHJQQZIKVTC23NWLQVP3WJ2RI2OTSJTNYOIGICST6DUXR",
    },
    {
      balance: "19.0000000",
      limit: "922337203685.4775807",
      buying_liabilities: "0.0000000",
      selling_liabilities: "0.0000000",
      last_modified_ledger: 19145605,
      asset_type: "credit_alphanum4",
      asset_code: "REPO",
      asset_issuer: "GCZNF24HPMYTV6NOEHI7Q5RJFFUI23JKUKY3H3XTQAFBQIBOHD5OXG3B",
    },
    {
      balance: "10.0000000",
      limit: "922337203685.4775807",
      buying_liabilities: "0.0000000",
      selling_liabilities: "0.0000000",
      last_modified_ledger: 18902253,
      asset_type: "credit_alphanum4",
      asset_code: "TERN",
      asset_issuer: "GDGQDVO6XPFSY4NMX75A7AOVYCF5JYGW2SHCJJNWCQWIDGOZB53DGP6C",
    },
    {
      balance: "0.0000000",
      limit: "922337203685.4775807",
      buying_liabilities: "0.0000000",
      selling_liabilities: "0.0000000",
      last_modified_ledger: 22718536,
      asset_type: "credit_alphanum4",
      asset_code: "WSD",
      asset_issuer: "GDSVWEA7XV6M5XNLODVTPCGMAJTNBLZBXOFNQD3BNPNYALEYBNT6CE2V",
    },
    {
      balance: "1.0000000",
      limit: "922337203685.4775807",
      buying_liabilities: "0.0000000",
      selling_liabilities: "0.0000000",
      last_modified_ledger: 22721290,
      asset_type: "credit_alphanum4",
      asset_code: "USD",
      asset_issuer: "GDUKMGUGDZQK6YHYA5Z6AY2G4XDSZPSZ3SW5UN3ARVMO6QSRDWP5YLEX",
    },
    {
      balance: "999.5689234",
      buying_liabilities: "0.0000000",
      selling_liabilities: "0.0000000",
      asset_type: "native",
    },
  ],
  signers: [
    {
      weight: 1,
      key: "PHYREXIA",
      type: "ed25519_public_key",
    },
  ],
  data: {},
};
