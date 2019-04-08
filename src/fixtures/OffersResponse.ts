export const OffersResponse = {
  _links: {
    self: {
      href:
        "https://horizon.stellar.org/accounts/PHYREXIA/offers?" +
        "c=0&cursor=&limit=50&order=asc",
    },
    next: {
      href:
        "https://horizon.stellar.org/accounts/PHYREXIA/offers?" +
        "c=0&cursor=76884793&limit=50&order=asc",
    },
    prev: {
      href:
        "https://horizon.stellar.org/accounts/PHYREXIA/offers?" +
        "c=0&cursor=76884793&limit=50&order=desc",
    },
  },
  _embedded: {
    records: [
      {
        _links: {
          self: {
            href: "https://horizon.stellar.org/offers/76884793",
          },
          offer_maker: {
            href: "https://horizon.stellar.org/accounts/PHYREXIA",
          },
        },
        id: 76884793,
        paging_token: "76884793",
        seller: "PHYREXIA",
        selling: {
          asset_type: "native",
        },
        buying: {
          asset_type: "credit_alphanum4",
          asset_code: "USD",
          asset_issuer:
            "GDUKMGUGDZQK6YHYA5Z6AY2G4XDSZPSZ3SW5UN3ARVMO6QSRDWP5YLEX",
        },
        amount: "8.0000000",
        price_r: {
          n: 1,
          d: 4,
        },
        price: "0.2500000",
        last_modified_ledger: 23121355,
        last_modified_time: "2019-03-26T21:26:27Z",
      },
      {
        _links: {
          self: {
            href: "https://horizon.stellar.org/offers/78448448",
          },
          offer_maker: {
            href: "https://horizon.stellar.org/accounts/PHYREXIA",
          },
        },
        id: 78448448,
        paging_token: "78448448",
        seller: "PHYREXIA",
        selling: {
          asset_type: "native",
        },
        buying: {
          asset_type: "credit_alphanum4",
          asset_code: "BAT",
          asset_issuer:
            "GBDEVU63Y6NTHJQQZIKVTC23NWLQVP3WJ2RI2OTSJTNYOIGICST6DUXR",
        },
        amount: "157.5538252",
        price_r: {
          n: 2500000,
          d: 6507729,
        },
        price: "0.3841586",
        last_modified_ledger: 23231292,
        last_modified_time: "2019-04-02T20:22:00Z",
      },
    ],
  },
};
