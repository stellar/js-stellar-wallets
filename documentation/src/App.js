import React, { useState } from "react";
import styled from "styled-components";
import raw from "raw.macro";

import { DisplayItem } from "components/DisplayItem";
import { Markdown } from "components/Markdown";
import { TableOfContents } from "components/TableOfContents";

import { getArmName } from "helpers/getArmName";

import { StateProvider } from "AppState";

import docs from "./docs.json";

const README = raw("../../README.md");

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
  padding-bottom: 100px;
  width: ${SIDEBAR_WIDTH}px;
  border-right: 1px solid black;
  overflow: scroll;
`;

const TocHeaderEl = styled.h3`
  background-color: #eee;
  padding: 5px 10px;
`;

const BodyEl = styled.div`
  padding: 20px;
`;

const HeadEl = styled.h3`
  cursor: pointer;
  color: ${(props) => (props.isCollapsed ? "#666" : "#111")};
  display: flex;
  justify-content: space-between;

  &:hover {
    color: ${(props) => (props.isCollapsed ? "rgba(0, 0, 255, .5)" : "#00F")};

    &:after {
      opacity: 0.8;
    }
  }

  &:after {
    content: ${(props) => (props.isCollapsed ? "'🔼'" : "'🔽'")};
  }
`;

const LIBRARY_EXPORTS = {
  TransferResponseType: 1,
  EffectType: 1,
  KeyType: 1,
  testEncrypter: 1,
  testKeyStore: 1,
  getTokenIdentifier: 1,
  getBalanceIdentifier: 1,
  getStellarSdkAsset: 1,
  DataProvider: 1,
  KeyManager: 1,
  KeyManagerPlugins: 1,
  DepositProvider: 1,
  WithdrawProvider: 1,
  getKycUrl: 1,
  getKeyMetadata: 1,
};

export const App = () => {
  const items = docs.children.reduce((memo, child) => {
    if (child.children) {
      if (child.kindString === "Namespace") {
        return [...memo, ...child.children];
      }
      return [...memo, child, ...child.children];
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

  /*
    We want the index to display the exports defined in LIBRARY_EXPORTS,
    indexed by kind.
  */

  const libraryExports = Object.keys(LIBRARY_EXPORTS).reduce((memo, name) => {
    const item = itemsByName[name];

    if (!item) {
      return memo;
    }

    const kind = item.kindString;

    return {
      ...memo,
      [kind]: [...(memo[kind] || []), item],
    };
  }, {});

  const interfacesAndTypes = items
    .filter((item) => !LIBRARY_EXPORTS[item.name])
    .filter(
      (item) =>
        item.kindString === "Class" ||
        item.kindString === "Interface" ||
        item.kindString === "Type alias" ||
        item.kindString === "Enumeration" ||
        item.kindString === "Variable" ||
        item.kindString === "Object literal",
    )
    .reduce((memo, item) => {
      const arm = getArmName(item.sources[0].fileName);
      return {
        ...memo,
        [arm]: [...(memo[arm] || []), item],
      };
    }, {});

  const [collapseMap, setCollapsed] = useState({});

  return (
    <StateProvider initialState={{ itemsById }}>
      <El>
        <TableOfContentsEl>
          <TocHeaderEl>About</TocHeaderEl>
          <ul>
            <li>
              <a href="#readme">README</a>
            </li>
          </ul>
          <TocHeaderEl>Library exports</TocHeaderEl>
          <TableOfContents items={libraryExports} />
          <TocHeaderEl>Types</TocHeaderEl>
          <TableOfContents items={interfacesAndTypes} />
        </TableOfContentsEl>

        <BodyEl>
          <div id="readme">
            <Markdown>{README}</Markdown>
          </div>

          <h2>Library exports</h2>

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

          <h2>Internal file exports</h2>
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
