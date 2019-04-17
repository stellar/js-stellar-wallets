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

const Item = styled.div`
  margin-bottom: 1.5%;
  border: 1px solid black;
  padding: 10px;
  vertical-align: top;
`;

function getItems(entity) {
  // entity is an array of stuff
  // loop through and either add its children, or add it
  return entity
    .reduce((memo, obj) => {
      if (obj.children) {
        return [...memo, obj, ...getItems(obj.children)];
      }

      return [...memo, obj];
    }, [])
    .filter((child) => !child.flags.isExternal);
  // .filter((child) => child.kindString !== "External module");
}

const App = () => {
  // make a list of all elements
  const items = docs.children
    // .filter((child) => !child.flags.isExternal)
    .reduce((memo, child) => {
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

  return (
    <StateProvider initialState={{ itemsById, itemsByName }}>
      <El>
        <IndexEl>
          <Index itemsByKind={itemsByKind} />
        </IndexEl>

        <BodyEl>
          {Object.keys(itemsByKind).map((kind) => (
            <div>
              <h2>{kind}</h2>

              <div>
                {itemsByKind[kind].map((item) => (
                  <DisplayItem isRootElement {...item} />
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
