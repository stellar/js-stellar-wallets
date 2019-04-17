import React from "react";

import DisplayLineNo from "components/DisplayLineNo";
import DisplayType from "components/DisplayType";

import Block from "basics/Block";

const DisplayInterface = ({ name, children, sources }) => {
  return (
    <div>
      <h5>
        interface <DisplayLineNo {...sources[0]}>{name}</DisplayLineNo> {"{"}
      </h5>
      <Block>{JSON.stringify(children, null, 2)}</Block>
      <h5>{"}"}</h5>
    </div>
  );
};

export default DisplayInterface;
