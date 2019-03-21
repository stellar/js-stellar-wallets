import BigNumber from "bignumber.js";

import { bigize } from "./bigize";

test("empty object returns empty", () => {
  expect(bigize({}, ["cost"])).toEqual({});
});

test("{ cost: '0.001' }", () => {
  expect(bigize({ cost: "0.001" }, ["cost"])).toEqual({
    cost: new BigNumber("0.001"),
  });
});

test("bigize zeros", () => {
  expect(bigize({ cost: "0" }, ["cost"])).toEqual({
    cost: new BigNumber("0"),
  });
});

test("{ cost: '0.001', cmc: '0.04' }", () => {
  expect(bigize({ cost: "0.001", cmc: "0.04" }, ["cost"])).toEqual({
    cost: new BigNumber("0.001"),
    cmc: "0.04",
  });
});

test("{ cost: '0.001', cmc: '0.04' }", () => {
  expect(bigize({ cost: "0.001", cmc: "0.04" }, ["cost", "cmc"])).toEqual({
    cost: new BigNumber("0.001"),
    cmc: new BigNumber("0.04"),
  });
});

test("null vals okay", () => {
  expect(bigize({ cost: "0.001", cmc: null }, ["cost", "cmc"])).toEqual({
    cost: new BigNumber("0.001"),
    cmc: null,
  });
});

test("undefined vals okay", () => {
  expect(bigize({ cost: "0.001" }, ["cost", "cmc"])).toEqual({
    cost: new BigNumber("0.001"),
  });
});

test("multilevel obj", () => {
  expect(
    bigize({ cost: "0.001", cmc: "0.04", color: { cost: "0.001", cmc: "0.04" } }, ["cost", "cmc"]),
  ).toEqual({
    cost: new BigNumber("0.001"),
    cmc: new BigNumber("0.04"),
    color: { cost: new BigNumber(0.001), cmc: new BigNumber(0.04) },
  });
});

test("Don't choke if something is already bigged", () => {
  expect(
    bigize(
      {
        cost: "0.001",
        cmc: new BigNumber("0.04"),
        color: { cost: "0.001", cmc: "0.04" },
      },
      ["cost", "cmc"],
    ),
  ).toEqual({
    cost: new BigNumber("0.001"),
    cmc: new BigNumber("0.04"),
    color: { cost: new BigNumber(0.001), cmc: new BigNumber(0.04) },
  });
});

test("arrays", () => {
  expect(
    bigize(
      [
        {
          cost: "0.001",
          cmc: "0.04",
          color: { cost: "0.001", cmc: "0.04" },
        },
      ],
      ["cost", "cmc"],
    ),
  ).toEqual([
    {
      cost: new BigNumber("0.001"),
      cmc: new BigNumber("0.04"),
      color: { cost: new BigNumber(0.001), cmc: new BigNumber(0.04) },
    },
  ]);
});

test("maps of arrays", () => {
  expect(
    bigize(
      {
        cost: "0.001",
        cmc: "0.04",
        color: [{ cost: "0.001", cmc: "0.04" }],
      },
      ["cost", "cmc"],
    ),
  ).toEqual({
    cost: new BigNumber("0.001"),
    cmc: new BigNumber(0.04),
    color: [{ cost: new BigNumber(0.001), cmc: new BigNumber(0.04) }],
  });
});

test("real-world data", () => {
  const data = bigize(
    [
      {
        timestamp: 1523548800000,
        tradeCount: 23,
        counterVolume: 22094,
        high: 1,
        low: 0,
        open: 0,
        close: 0.53,
      },
      {
        timestamp: 1523552400000,
        tradeCount: 57,
        counterVolume: 64935,
        high: 0.53,
        low: 0.53,
        open: 0.53,
        close: 0.53,
      },
      {
        timestamp: 1523556000000,
        tradeCount: 8,
        counterVolume: 9485,
        high: 0.53,
        low: 0.53,
        open: 0.53,
        close: 0.53,
      },
      {
        timestamp: 1523559600000,
        tradeCount: 89,
        counterVolume: 101822.8293153,
        high: 0.53,
        low: 0.53,
        open: 0.53,
        close: 0.53,
      },
      {
        timestamp: 1523563200000,
        tradeCount: 5,
        counterVolume: 7420.6706847,
        high: 0.53,
        low: 0.53,
        open: 0.53,
        close: 0.53,
      },
      {
        timestamp: 1523566800000,
        tradeCount: 22,
        counterVolume: 22116.229316,
        high: 0.53,
        low: 0.53,
        open: 0.53,
        close: 0.53,
      },
    ],
    ["tradeCount", "counterVolume", "high", "low", "open", "close"],
  );

  expect(data).toEqual([
    {
      timestamp: 1523548800000,
      tradeCount: new BigNumber(23),
      counterVolume: new BigNumber(22094),
      high: new BigNumber(1),
      low: new BigNumber(0),
      open: new BigNumber(0),
      close: new BigNumber(0.53),
    },
    {
      timestamp: 1523552400000,
      tradeCount: new BigNumber(57),
      counterVolume: new BigNumber(64935),
      high: new BigNumber(0.53),
      low: new BigNumber(0.53),
      open: new BigNumber(0.53),
      close: new BigNumber(0.53),
    },
    {
      timestamp: 1523556000000,
      tradeCount: new BigNumber(8),
      counterVolume: new BigNumber(9485),
      high: new BigNumber(0.53),
      low: new BigNumber(0.53),
      open: new BigNumber(0.53),
      close: new BigNumber(0.53),
    },
    {
      timestamp: 1523559600000,
      tradeCount: new BigNumber(89),
      counterVolume: new BigNumber(101822.8293153),
      high: new BigNumber(0.53),
      low: new BigNumber(0.53),
      open: new BigNumber(0.53),
      close: new BigNumber(0.53),
    },
    {
      timestamp: 1523563200000,
      tradeCount: new BigNumber(5),
      counterVolume: new BigNumber(7420.6706847),
      high: new BigNumber(0.53),
      low: new BigNumber(0.53),
      open: new BigNumber(0.53),
      close: new BigNumber(0.53),
    },
    {
      timestamp: 1523566800000,
      tradeCount: new BigNumber(22),
      counterVolume: new BigNumber(22116.229316),
      high: new BigNumber(0.53),
      low: new BigNumber(0.53),
      open: new BigNumber(0.53),
      close: new BigNumber(0.53),
    },
  ]);
});
