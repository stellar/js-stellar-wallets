// tslint:disable max-line-length

export const Payments = {
  _links: {
    self: {
      href:
        "https://horizon.stellar.org/accounts/PHYREXIA/payments?" +
        "c=0.09952538721746818\u0026cursor=\u0026limit=50\u0026order=asc",
    },
    next: {
      href:
        "https://horizon.stellar.org/accounts/PHYREXIA/payments?" +
        "c=0.09952538721746818\u0026cursor=102887423339499539\u0026limit=50\u0026order=asc",
    },
    prev: {
      href:
        "https://horizon.stellar.org/accounts/PHYREXIA/payments?" +
        "c=0.09952538721746818\u0026cursor=74305992237531137\u0026limit=50\u0026order=desc",
    },
  },
  _embedded: {
    records: [
      {
        _links: {
          self: {
            href: "https://horizon.stellar.org/operations/74305992237531137",
          },
          transaction: {
            href:
              "https://horizon.stellar.org/transactions/" +
              "7162c8d3819441d5ae175d48f39ee030e1dcb0a8565774dd1f1010929be8a2ed",
          },
          effects: {
            href:
              "https://horizon.stellar.org/operations/74305992237531137/effects",
          },
          succeeds: {
            href:
              "https://horizon.stellar.org/effects?order=desc\u0026cursor=74305992237531137",
          },
          precedes: {
            href:
              "https://horizon.stellar.org/effects?order=asc\u0026cursor=74305992237531137",
          },
        },
        id: "74305992237531137",
        paging_token: "74305992237531137",
        transaction_successful: true,
        source_account: "SERRA",
        type: "create_account",
        type_i: 0,
        created_at: "2018-04-11T18:41:07Z",
        transaction_hash:
          "7162c8d3819441d5ae175d48f39ee030e1dcb0a8565774dd1f1010929be8a2ed",
        starting_balance: "1000.0000000",
        funder: "SERRA",
        account: "PHYREXIA",
      },
      {
        _links: {
          self: {
            href: "https://horizon.stellar.org/operations/74961434311663617",
          },
          transaction: {
            href:
              "https://horizon.stellar.org/transactions/" +
              "839145d13147bb7388a47d8659aefa66217942fe99d0fa44866dc216953867f4",
          },
          effects: {
            href:
              "https://horizon.stellar.org/operations/74961434311663617/effects",
          },
          succeeds: {
            href:
              "https://horizon.stellar.org/effects?order=desc\u0026cursor=74961434311663617",
          },
          precedes: {
            href:
              "https://horizon.stellar.org/effects?order=asc\u0026cursor=74961434311663617",
          },
        },
        id: "74961434311663617",
        paging_token: "74961434311663617",
        transaction_successful: true,
        source_account: "SERRA",
        type: "path_payment",
        type_i: 2,
        created_at: "2018-04-20T14:42:46Z",
        transaction_hash:
          "839145d13147bb7388a47d8659aefa66217942fe99d0fa44866dc216953867f4",
        asset_type: "native",
        from: "SERRA",
        to: "PHYREXIA",
        amount: "10.0000000",
        path: [],
        source_amount: "10.0000000",
        source_max: "10.0000000",
        source_asset_type: "native",
      },
      {
        _links: {
          self: {
            href: "https://horizon.stellar.org/operations/74961481556307969",
          },
          transaction: {
            href:
              "https://horizon.stellar.org/transactions/" +
              "75cd04c11950c0f9ead2afb9d72da4adfd38d44ea4477b8219806025778cd8db",
          },
          effects: {
            href:
              "https://horizon.stellar.org/operations/74961481556307969/effects",
          },
          succeeds: {
            href:
              "https://horizon.stellar.org/effects?order=desc\u0026cursor=74961481556307969",
          },
          precedes: {
            href:
              "https://horizon.stellar.org/effects?order=asc\u0026cursor=74961481556307969",
          },
        },
        id: "74961481556307969",
        paging_token: "74961481556307969",
        transaction_successful: true,
        source_account: "SERRA",
        type: "path_payment",
        type_i: 2,
        created_at: "2018-04-20T14:43:41Z",
        transaction_hash:
          "75cd04c11950c0f9ead2afb9d72da4adfd38d44ea4477b8219806025778cd8db",
        asset_type: "credit_alphanum4",
        asset_code: "REPO",
        asset_issuer:
          "GCZNF24HPMYTV6NOEHI7Q5RJFFUI23JKUKY3H3XTQAFBQIBOHD5OXG3B",
        from: "SERRA",
        to: "PHYREXIA",
        amount: "10.0000000",
        path: [],
        source_amount: "5.3000000",
        source_max: "5.3000000",
        source_asset_type: "native",
      },
      {
        _links: {
          self: {
            href: "https://horizon.stellar.org/operations/95518827122688002",
          },
          transaction: {
            href:
              "https://horizon.stellar.org/transactions/" +
              "cb7cbde5660f64038ca2341f0c7e31a37f15f8fe88bda304ec64a6c2ebbbd420",
          },
          effects: {
            href:
              "https://horizon.stellar.org/operations/95518827122688002/effects",
          },
          succeeds: {
            href:
              "https://horizon.stellar.org/effects?order=desc\u0026cursor=95518827122688002",
          },
          precedes: {
            href:
              "https://horizon.stellar.org/effects?order=asc\u0026cursor=95518827122688002",
          },
        },
        id: "95518827122688002",
        paging_token: "95518827122688002",
        transaction_successful: true,
        source_account:
          "GDM4UWTGHCWSTM7Z46PNF4BLH35GS6IUZYBWNNI4VU5KVIHYSIVQ55Y6",
        type: "payment",
        type_i: 1,
        created_at: "2019-01-30T23:00:14Z",
        transaction_hash:
          "cb7cbde5660f64038ca2341f0c7e31a37f15f8fe88bda304ec64a6c2ebbbd420",
        asset_type: "native",
        from: "GDM4UWTGHCWSTM7Z46PNF4BLH35GS6IUZYBWNNI4VU5KVIHYSIVQ55Y6",
        to: "PHYREXIA",
        amount: "0.0000300",
      },
    ],
  },
};
