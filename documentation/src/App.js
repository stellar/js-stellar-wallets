import React from "react";
import styled from "styled-components";

import DisplayItem from "components/DisplayItem";
import TableOfContents from "components/TableOfContents";

import { getArmName } from "helpers/getArmName";

import { StateProvider } from "AppState";

import docs from "./docs.json";

const SIDEBAR_WIDTH = 300;

const El = styled.div`
  position: relative;
  padding-left: ${SIDEBAR_WIDTH}px;
`;

const TableOfContentsEl = styled.div`
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
    if (child.children) {
      return [...memo, ...child.children];
    }
    return [...memo, child];
  }, []);

  const itemsByKind = items.reduce((memo, item) => {
    const kind = item.kindString;

    return {
      ...memo,
      [kind]: [...(memo[kind] || []), item],
    };
  }, {});

  const itemsByFilename = items.reduce((memo, item) => {
    const fileName = getArmName(item.sources[0].fileName);

    return {
      ...memo,
      [fileName]: [...(memo[fileName] || []), item],
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
    const fileName = getArmName(item.sources[0].fileName);

    return {
      ...memo,
      [fileName]: [...(memo[fileName] || []), item],
    };
  }, []);

  return (
    <StateProvider initialState={{ itemsById, itemsByName }}>
      <El>
        <TableOfContentsEl>
          <TableOfContents itemsByKind={libraryExports} />
        </TableOfContentsEl>

        <BodyEl>
          {Object.keys(itemsByFilename).map((kind, i) => (
            <div key={`${kind}_${i}`}>
              <h2>{kind}</h2>

              <div>
                {itemsByFilename[kind]
                  .sort((a, b) =>
                    a.sources[0].fileName.localeCompare(b.sources[0].fileName),
                  )
                  .map((item, i) => (
                    <DisplayItem
                      key={`${i}_${item.id}`}
                      isRootElement
                      {...item}
                    />
                  ))}
              </div>
            </div>
          ))}
        </BodyEl>
      </El>
    </StateProvider>
  );
};

export default App;
