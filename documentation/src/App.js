import React, { Component } from "react";
import styled from "styled-components";

import DisplayClass from "components/DisplayClass";

import "./App.css";

import docs from "./docs.json";

const Item = styled.div`
  width: 25%;
  display: inline-block;
  margin: 1.5%;
  border: 1px solid black;
  padding: 10px;
  vertical-align: top;
  height: 50vh;
  overflow: scroll;
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
    .filter((child) => !child.flags.isExternal)
    .filter((child) => child.kindString !== "External module");
}

class App extends Component {
  render() {
    // make a list of all elements
    const items = docs.children
      .filter((child) => !child.flags.isExternal)
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

    const countsByKind = Object.keys(itemsByKind).reduce(
      (memo, kind) => ({
        ...memo,
        [kind]: itemsByKind[kind].length,
      }),
      {},
    );

    return (
      <div className="App">
        <p>Won't somebody think of the {items.length} children</p>
        <p>Kinds: {JSON.stringify(countsByKind)}</p>

        {Object.keys(itemsByKind).map((kind) => (
          <div>
            <h2>{kind}</h2>

            <div>
              {itemsByKind[kind].map((item) => (
                <Item>
                  {item.kindString === "Class" && <DisplayClass {...item} />}
                  {item.kindString !== "Class" && (
                    <pre>{JSON.stringify(item, null, 2)}</pre>
                  )}
                </Item>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }
}

export default App;
