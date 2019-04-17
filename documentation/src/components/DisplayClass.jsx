import React from "react";

import DisplayMethod from "components/DisplayMethod";

import Block from "basics/Block";

const DisplayClass = ({ name, children }) => {
  return (
    <div>
      <h3>
        class {name} {"{"}
      </h3>
      <Block>
        {children.map((child) => (
          <DisplayMethod {...child} />
        ))}
      </Block>
    </div>
  );
};

export default DisplayClass;
