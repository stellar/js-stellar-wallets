import React from "react";
import styled from "styled-components";

import DisplayItem from "components/DisplayItem";
import Index from "components/Index";

import { StateProvider } from "AppState";

import docs from "./docs.json";

const SIDEBAR_WIDTH = 300;

const El = styled.div`
  position: relative;
  padding-left: ${SIDEBAR_WIDTH}px;
`;

const IndexEl = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  padding: 20px;
  width: ${SIDEBAR_WIDTH}px;
  border-right: 1px solid black;
  overflow: scroll;
`;

const BodyEl = styled.div`
  padding: 20px;
`;

const LIBRARY_EXPORTS = [
  "EffectType",
  "KeyType",
  "testEncrypter",
  "testKeyStore",
  "getTokenIdentifier",
  "getBalanceIdentifier",
  "reframeEffect",
  "DataProvider",
  "KeyManager",
  "KeyManagerPlugins",
  "DepositProvider",
  "WithdrawProvider",
  "getKycUrl",
];

const KINDS_TO_DISPLAY = ["Interface", "Type alias"];

const App = () => {
  const items = docs.children.reduce((memo, child) => {
    if (child.originalName.indexOf("js-stellar-wallets/src/index.ts") !== -1) {
      memo.push(child);
    }
    if (child.children) {
      return [...memo, ...child.children];
    }
    return [...memo, child];
  }, []);

  // sort them all by kind string
  const itemsByKind = items.reduce((memo, item) => {
    const kind = item.kindString;

    return {
      ...memo,
      [kind]: [...(memo[kind] || []), item],
    };
  }, {});

  const itemsById = items.reduce(
    (memo, item) => ({
      ...memo,
      [item.id]: item,
    }),
    {},
  );

  const itemsByName = items.reduce(
    (memo, item) => ({
      ...memo,
      [item.name]: item,
    }),
    {},
  );

  /*
    We want the index to display:
    - the kind names in KINDS_TO_DISPLAY 
    - the exports defined in LIBRARY_EXPORTS
    And we want to index them by KIND.
  */

  const importantTypes = KINDS_TO_DISPLAY.reduce(
    (memo, kind) => ({ ...memo, [kind]: itemsByKind[kind] }),
    {},
  );

  const libraryExports = LIBRARY_EXPORTS.reduce((memo, name) => {
    const item = itemsByName[name];

    if (!item) {
      console.log("no item for ", name);
      return memo;
    }
    const kind = item.kindString;

    return {
      ...memo,
      [kind]: [...(memo[kind] || []), item],
    };
  }, []);

  return (
    <StateProvider initialState={{ itemsById, itemsByName }}>
      <El>
        <IndexEl>
          <h2>Library Exports</h2>
          <Index itemsByKind={libraryExports} />
          <h2>Type Definitions</h2>
          <Index itemsByKind={importantTypes} />
        </IndexEl>

        <BodyEl>
          {[...Object.keys(libraryExports), ...Object.keys(importantTypes)].map(
            (kind) => (
              <div>
                <h2>{kind}</h2>

                <div>
                  {itemsByKind[kind]
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((item) => (
                      <DisplayItem isRootElement {...item} />
                    ))}
                </div>
              </div>
            ),
          )}
        </BodyEl>
      </El>
    </StateProvider>
  );
};

export default App;
