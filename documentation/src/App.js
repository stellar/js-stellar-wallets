import React, { useState } from "react";
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

const HeadEl = styled.h2`
  cursor: pointer;
  color: ${(props) => (props.isCollapsed ? "#666" : "#111")};
  display: flex;
  justify-content: space-between;

  &:hover {
    color: ${(props) => (props.isCollapsed ? "#00A" : "#00F")};

    &:after {
      opacity: 0.8;
    }
  }

  &:after {
    content: ${(props) => (props.isCollapsed ? "'🔼'" : "'🔽'")};
  }
`;

const LIBRARY_EXPORTS = {
  EffectType: 1,
  KeyType: 1,
  testEncrypter: 1,
  testKeyStore: 1,
  getTokenIdentifier: 1,
  getBalanceIdentifier: 1,
  reframeEffect: 1,
  DataProvider: 1,
  KeyManager: 1,
  KeyManagerPlugins: 1,
  DepositProvider: 1,
  WithdrawProvider: 1,
  getKycUrl: 1,
};

const App = () => {
  const items = docs.children.reduce((memo, child) => {
    if (child.children) {
      return [...memo, ...child.children];
    }
    return [...memo, child];
  }, []);

  const privateItemsByArm = items
    .filter((item) => !LIBRARY_EXPORTS[item.name])
    .reduce((memo, item) => {
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

  const itemsByKind = items.reduce(
    (memo, item) => ({
      ...memo,
      [item.kindString]: item,
    }),
    {},
  );

  /*
    We want the index to display:
    - the kind names in KINDS_TO_DISPLAY 
    - the exports defined in LIBRARY_EXPORTS
    And we want to index them by KIND.
  */

  const libraryExports = Object.keys(LIBRARY_EXPORTS).reduce((memo, name) => {
    const item = itemsByName[name];
    const arm = getArmName(item.sources[0].fileName);

    return {
      ...memo,
      [arm]: [...(memo[arm] || []), item],
    };
  }, {});

  const interfacesAndTypes = ["Interface", "Type alias"].reduce(
    (memo, kindString) => {
      const item = itemsByKind[kindString];

      return {
        ...memo,
        [kindString]: [...(memo[kindString] || []), item],
      };
    },
    {},
  );

  const [collapseMap, setCollapsed] = useState({});

  return (
    <StateProvider initialState={{ itemsById }}>
      <El>
        <TableOfContentsEl>
          <h2>Library exports</h2>
          <TableOfContents itemsByKind={libraryExports} />
          <h2>Interfaces and types</h2>
          <TableOfContents itemsByKind={interfacesAndTypes} />
        </TableOfContentsEl>

        <BodyEl>
          <h1>Library exports</h1>

          {Object.keys(libraryExports).map((arm, i) => (
            <div key={`exports_${arm}_${i}`}>
              <HeadEl
                onClick={() =>
                  setCollapsed({
                    ...collapseMap,
                    [`exports_${arm}`]: !collapseMap[`exports_${arm}`],
                  })
                }
                isCollapsed={collapseMap[`exports_${arm}`]}
              >
                {arm}
              </HeadEl>

              {!collapseMap[`exports_${arm}`] && (
                <div>
                  {libraryExports[arm]
                    .sort((a, b) =>
                      a.sources[0].fileName.localeCompare(
                        b.sources[0].fileName,
                      ),
                    )
                    .map((item, i) => (
                      <DisplayItem
                        key={`${i}_${item.id}`}
                        isRootElement
                        {...item}
                      />
                    ))}
                </div>
              )}
            </div>
          ))}

          <h1>Internal file exports</h1>
          {Object.keys(privateItemsByArm).map((arm, i) => (
            <div key={`else_${arm}_${i}`}>
              <HeadEl
                onClick={() =>
                  setCollapsed({
                    ...collapseMap,
                    [`else_${arm}`]: !collapseMap[`else_${arm}`],
                  })
                }
                isCollapsed={collapseMap[`else_${arm}`]}
              >
                {arm}
              </HeadEl>

              {!collapseMap[`else_${arm}`] && (
                <div>
                  {privateItemsByArm[arm]
                    .sort((a, b) =>
                      a.sources[0].fileName.localeCompare(
                        b.sources[0].fileName,
                      ),
                    )
                    .map((item, i) => (
                      <DisplayItem
                        key={`${i}_${item.id}`}
                        isRootElement
                        {...item}
                      />
                    ))}
                </div>
              )}
            </div>
          ))}
        </BodyEl>
      </El>
    </StateProvider>
  );
};

export default App;
