export const TradesResponsePartialFill = {
  _links: {
    self: {
      href:
        "https://horizon.stellar.org/accounts/PHYREXIA/trades?cursor=" +
        "\u0026limit=10\u0026order=desc",
    },
    next: {
      href:
        "https://horizon.stellar.org/accounts/PHYREXIA/trades?cursor=" +
        "81184558455754753-22\u0026limit=10\u0026order=desc",
    },
    prev: {
      href:
        "https://horizon.stellar.org/accounts/PHYREXIA/trades?cursor=" +
        "99777678038634508-0\u0026limit=10\u0026order=asc",
    },
  },
  _embedded: {
    records: [
      // the partial trade
      {
        _links: {
          self: {
            href: "",
          },
          base: {
            href: "https://horizon.stellar.org/accounts/PHYREXIA",
          },
          counter: {
            href: "https://horizon.stellar.org/accounts/SERRA",
          },
          operation: {
            href: "https://horizon.stellar.org/operations/99777639383887873",
          },
        },
        id: "99777639383887873-0",
        paging_token: "99777639383887873-0",
        ledger_close_time: "2019-04-02T20:22:00Z",
        offer_id: "78448401",
        base_offer_id: "78448448",
        base_account: "PHYREXIA",
        base_amount: "363.0644948",
        base_asset_type: "native",
        counter_offer_id: "78448401",
        counter_account: "SERRA",
        counter_amount: "139.5761839",
        counter_asset_type: "credit_alphanum4",
        counter_asset_code: "BAT",
        counter_asset_issuer:
          "GBDEVU63Y6NTHJQQZIKVTC23NWLQVP3WJ2RI2OTSJTNYOIGICST6DUXR",
        base_is_seller: false,
        price: {
          n: 10000000,
          d: 26011923,
        },
      },
    ],
  },
};

export const TradesResponseFullFill = {
  _links: {
    self: {
      href:
        "https://horizon.stellar.org/accounts/PHYREXIA/trades?cursor=" +
        "\u0026limit=10\u0026order=desc",
    },
    next: {
      href:
        "https://horizon.stellar.org/accounts/PHYREXIA/trades?cursor=" +
        "81184558455754753-22\u0026limit=10\u0026order=desc",
    },
    prev: {
      href:
        "https://horizon.stellar.org/accounts/PHYREXIA/trades?cursor=" +
        "99777678038634508-0\u0026limit=10\u0026order=asc",
    },
  },
  _embedded: {
    records: [
      // the closing trade
      {
        _links: {
          self: {
            href: "",
          },
          base: {
            href: "https://horizon.stellar.org/accounts/PHYREXIA",
          },
          counter: {
            href: "https://horizon.stellar.org/accounts/SERRA",
          },
          operation: {
            href: "https://horizon.stellar.org/operations/99777678038634508",
          },
        },
        id: "99777678038634508-0",
        paging_token: "99777678038634508-0",
        ledger_close_time: "2019-04-02T20:22:55Z",
        offer_id: "78448448",
        base_offer_id: "78448448",
        base_account: "PHYREXIA",
        base_amount: "157.5538252",
        base_asset_type: "native",
        counter_offer_id: "78448588",
        counter_account: "SERRA",
        counter_amount: "60.5256554",
        counter_asset_type: "credit_alphanum4",
        counter_asset_code: "BAT",
        counter_asset_issuer:
          "GBDEVU63Y6NTHJQQZIKVTC23NWLQVP3WJ2RI2OTSJTNYOIGICST6DUXR",
        base_is_seller: true,
        price: {
          n: 2500000,
          d: 6507729,
        },
      },
      // the partial trade
      {
        _links: {
          self: {
            href: "",
          },
          base: {
            href: "https://horizon.stellar.org/accounts/PHYREXIA",
          },
          counter: {
            href: "https://horizon.stellar.org/accounts/SERRA",
          },
          operation: {
            href: "https://horizon.stellar.org/operations/99777639383887873",
          },
        },
        id: "99777639383887873-0",
        paging_token: "99777639383887873-0",
        ledger_close_time: "2019-04-02T20:22:00Z",
        offer_id: "78448401",
        base_offer_id: "78448448",
        base_account: "PHYREXIA",
        base_amount: "363.0644948",
        base_asset_type: "native",
        counter_offer_id: "78448401",
        counter_account: "SERRA",
        counter_amount: "139.5761839",
        counter_asset_type: "credit_alphanum4",
        counter_asset_code: "BAT",
        counter_asset_issuer:
          "GBDEVU63Y6NTHJQQZIKVTC23NWLQVP3WJ2RI2OTSJTNYOIGICST6DUXR",
        base_is_seller: false,
        price: {
          n: 10000000,
          d: 26011923,
        },
      },
    ],
  },
};
