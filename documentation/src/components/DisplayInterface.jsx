import React from "react";

import DisplayItem from "components/DisplayItem";
import DisplayType from "components/DisplayType";

import Block from "basics/Block";

const DisplayInterface = ({
  kindString,
  name,
  children = [],
  extendedTypes = [],
  implementedTypes = [],
  ...rest
}) => {
  return (
    <div>
      <h5>
        {kindString.toLowerCase()} {name}
        {!!extendedTypes.length &&
          extendedTypes.map((extendedType) => (
            <>
              {" "}
              extends <DisplayType {...extendedType} />
            </>
          ))}
        {" {"}
      </h5>
      {children
        .sort((a, b) => a.sources[0].line - b.sources[0].line)
        .map((child) => (
          <Block>
            <DisplayItem {...child} />
          </Block>
        ))}
      <h5>{"}"}</h5>
    </div>
  );
};

export default DisplayInterface;
