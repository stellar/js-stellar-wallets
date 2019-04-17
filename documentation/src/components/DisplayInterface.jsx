import React from "react";

import DisplayItem from "components/DisplayItem";
import TypePeeker from "components/TypePeeker";

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
              extends <TypePeeker {...extendedType} />
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
