// tslint:disable max-line-length

export const SponsoredAccountResponse = {
  _links: {
    self: {
      href:
        "https://horizon-testnet.stellar.org/accounts/GBB57GHOE426YQWTGB3C3UPM62BN353AYA3ZU63BUMCRL7D6XQUJH4KK",
    },
    transactions: {
      href:
        "https://horizon-testnet.stellar.org/accounts/GBB57GHOE426YQWTGB3C3UPM62BN353AYA3ZU63BUMCRL7D6XQUJH4KK/transactions{?cursor,limit,order}",
      templated: true,
    },
    operations: {
      href:
        "https://horizon-testnet.stellar.org/accounts/GBB57GHOE426YQWTGB3C3UPM62BN353AYA3ZU63BUMCRL7D6XQUJH4KK/operations{?cursor,limit,order}",
      templated: true,
    },
    payments: {
      href:
        "https://horizon-testnet.stellar.org/accounts/GBB57GHOE426YQWTGB3C3UPM62BN353AYA3ZU63BUMCRL7D6XQUJH4KK/payments{?cursor,limit,order}",
      templated: true,
    },
    effects: {
      href:
        "https://horizon-testnet.stellar.org/accounts/GBB57GHOE426YQWTGB3C3UPM62BN353AYA3ZU63BUMCRL7D6XQUJH4KK/effects{?cursor,limit,order}",
      templated: true,
    },
    offers: {
      href:
        "https://horizon-testnet.stellar.org/accounts/GBB57GHOE426YQWTGB3C3UPM62BN353AYA3ZU63BUMCRL7D6XQUJH4KK/offers{?cursor,limit,order}",
      templated: true,
    },
    trades: {
      href:
        "https://horizon-testnet.stellar.org/accounts/GBB57GHOE426YQWTGB3C3UPM62BN353AYA3ZU63BUMCRL7D6XQUJH4KK/trades{?cursor,limit,order}",
      templated: true,
    },
    data: {
      href:
        "https://horizon-testnet.stellar.org/accounts/GBB57GHOE426YQWTGB3C3UPM62BN353AYA3ZU63BUMCRL7D6XQUJH4KK/data/{key}",
      templated: true,
    },
  },
  id: "GBB57GHOE426YQWTGB3C3UPM62BN353AYA3ZU63BUMCRL7D6XQUJH4KK",
  account_id: "GBB57GHOE426YQWTGB3C3UPM62BN353AYA3ZU63BUMCRL7D6XQUJH4KK",
  sequence: "8496918485270532",
  subentry_count: 8,
  last_modified_ledger: 1978405,
  last_modified_time: "2021-02-25T18:04:40Z",
  thresholds: {
    low_threshold: 20,
    med_threshold: 20,
    high_threshold: 20,
  },
  flags: {
    auth_required: false,
    auth_revocable: false,
    auth_immutable: false,
  },
  balances: [
    {
      balance: "10.0000000",
      limit: "922337203685.4775807",
      buying_liabilities: "0.0000000",
      selling_liabilities: "0.0000000",
      sponsor: "GBG7VGZFH4TU2GS7WL5LMPYFNP64ZFR23XEGAV7GPEEXKWOR2DKCYPCK",
      last_modified_ledger: 1978496,
      is_authorized: true,
      is_authorized_to_maintain_liabilities: true,
      asset_type: "credit_alphanum4",
      asset_code: "ARST",
      asset_issuer: "GB7TAYRUZGE6TVT7NHP5SMIZRNQA6PLM423EYISAOAP3MKYIQMVYP2JO",
    },
    {
      balance: "0.0000000",
      limit: "922337203685.4775807",
      buying_liabilities: "0.0000000",
      selling_liabilities: "0.0000000",
      sponsor: "GBG7VGZFH4TU2GS7WL5LMPYFNP64ZFR23XEGAV7GPEEXKWOR2DKCYPCK",
      last_modified_ledger: 1978344,
      is_authorized: true,
      is_authorized_to_maintain_liabilities: true,
      asset_type: "credit_alphanum4",
      asset_code: "SRT",
      asset_issuer: "GCDNJUBQSX7AJWLJACMJ7I4BC3Z47BQUTMHEICZLE6MU4KQBRYG5JY6B",
    },
    {
      balance: "0.0000000",
      limit: "922337203685.4775807",
      buying_liabilities: "0.0000000",
      selling_liabilities: "0.0000000",
      sponsor: "GBG7VGZFH4TU2GS7WL5LMPYFNP64ZFR23XEGAV7GPEEXKWOR2DKCYPCK",
      last_modified_ledger: 1978343,
      is_authorized: true,
      is_authorized_to_maintain_liabilities: true,
      asset_type: "credit_alphanum4",
      asset_code: "USD",
      asset_issuer: "GCKFBEIYV2U22IO2BJ4KVJOIP7XPWQGQFKKWXR6DOSJBV7STMAQSMTGG",
    },
    {
      balance: "5.0000000",
      limit: "922337203685.4775807",
      buying_liabilities: "0.0000000",
      selling_liabilities: "0.0000000",
      sponsor: "GBG7VGZFH4TU2GS7WL5LMPYFNP64ZFR23XEGAV7GPEEXKWOR2DKCYPCK",
      last_modified_ledger: 1978489,
      is_authorized: true,
      is_authorized_to_maintain_liabilities: true,
      asset_type: "credit_alphanum4",
      asset_code: "USDC",
      asset_issuer: "GC5W3BH2MQRQK2H4A6LP3SXDSAAY2W2W64OWKKVNQIAOVWSAHFDEUSDC",
    },
    {
      balance: "0.0000000",
      buying_liabilities: "0.0000000",
      selling_liabilities: "0.0000000",
      asset_type: "native",
    },
  ],
  signers: [
    {
      weight: 10,
      key: "GARU3M6AQRQVFVO5AR3Q6WIZHYVZZ7HSWQTMX37TLUPUYZ2V5TRQ5HCS",
      type: "ed25519_public_key",
      sponsor: "GBG7VGZFH4TU2GS7WL5LMPYFNP64ZFR23XEGAV7GPEEXKWOR2DKCYPCK",
    },
    {
      weight: 10,
      key: "GAVH6LKGAKQQOTLPVMXZYROK7O54XAHQG326ETWSM7L4J33AP6DIMNNR",
      type: "ed25519_public_key",
      sponsor: "GBG7VGZFH4TU2GS7WL5LMPYFNP64ZFR23XEGAV7GPEEXKWOR2DKCYPCK",
    },
    {
      weight: 20,
      key: "GC6HQ2GRVXTLL7BQVPBDWCENOPBZHW4BA4NVF2FT7555S37ONQJNCDH2",
      type: "ed25519_public_key",
      sponsor: "GBG7VGZFH4TU2GS7WL5LMPYFNP64ZFR23XEGAV7GPEEXKWOR2DKCYPCK",
    },
    {
      weight: 20,
      key: "GCQ5RD3JRNPRMB24MAQYFEZEV7J6IHUL2JFN65RC6M3KAPMNXWR7LN5W",
      type: "ed25519_public_key",
      sponsor: "GBG7VGZFH4TU2GS7WL5LMPYFNP64ZFR23XEGAV7GPEEXKWOR2DKCYPCK",
    },
    {
      weight: 0,
      key: "GBB57GHOE426YQWTGB3C3UPM62BN353AYA3ZU63BUMCRL7D6XQUJH4KK",
      type: "ed25519_public_key",
    },
  ],
  data: {},
  num_sponsoring: 0,
  num_sponsored: 10,
  sponsor: "GBG7VGZFH4TU2GS7WL5LMPYFNP64ZFR23XEGAV7GPEEXKWOR2DKCYPCK",
  paging_token: "GBB57GHOE426YQWTGB3C3UPM62BN353AYA3ZU63BUMCRL7D6XQUJH4KK",
};
