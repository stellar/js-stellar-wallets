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
}) => {
  return (
    <div>
      <div>
        {kindString === "Enumeration" ? "enum" : kindString.toLowerCase()}{" "}
        <strong>{name}</strong>
        {!!implementedTypes.length &&
          implementedTypes.map((implementedType) => (
            <>
              {" "}
              implements <TypePeeker {...implementedType} />
            </>
          ))}
        {!!extendedTypes.length &&
          extendedTypes.map((extendedType) => (
            <>
              {" "}
              extends <TypePeeker {...extendedType} />
            </>
          ))}
      </div>
      {children
        .sort((a, b) => a.sources[0].line - b.sources[0].line)
        .map((child) => (
          <Block>
            <DisplayItem {...child} />
          </Block>
        ))}
    </div>
  );
};

export default DisplayInterface;
