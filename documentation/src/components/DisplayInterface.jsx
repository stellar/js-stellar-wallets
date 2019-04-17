import React from "react";

import DisplayItem from "components/DisplayItem";
import TypePeeker from "components/TypePeeker";

import Block from "basics/Block";
import BraceLine from "basics/BraceLine";

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
      <BraceLine>
        {kindString.toLowerCase()} {name}
        {!!extendedTypes.length &&
          extendedTypes.map((extendedType) => (
            <>
              {" "}
              extends <TypePeeker {...extendedType} />
            </>
          ))}
        {" {"}
      </BraceLine>
      {children
        .sort((a, b) => a.sources[0].line - b.sources[0].line)
        .map((child) => (
          <Block>
            <DisplayItem {...child} />
          </Block>
        ))}
      <BraceLine>{"}"}</BraceLine>
    </div>
  );
};

export default DisplayInterface;
