import React, { Component } from "react";
import { isArray, isObject } from "lodash";

import "./App.css";

import docs from "./docs.json";

function getChildren(entity) {
  // entity is an array of stuff
  // loop through and either add its children, or add it
  return entity
    .filter((child) => !child.flags.isExternal)
    .reduce((memo, obj) => {
      if (obj.children) {
        return [...memo, ...getChildren(obj.children)];
      }

      return [...memo, obj];
    }, []);
}

class App extends Component {
  render() {
    const children = getChildren(docs.children);

    return (
      <div className="App">
        <p>Won't somebody think of the {children.length} children</p>
        <pre>{JSON.stringify(children, null, 2)}</pre>
      </div>
    );
  }
}

export default App;
