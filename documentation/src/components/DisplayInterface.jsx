import React from "react";

import DisplayItem from "components/DisplayItem";
import TypePeeker from "components/TypePeeker";

import Block from "basics/Block";

const DisplayInterface = (params) => {
  const {
    kindString,
    name,
    children = [],
    extendedTypes = [],
    implementedTypes = [],
    indexSignature = [],
  } = params;

  return (
    <div>
      <div>
        {kindString === "Enumeration" ? "enum" : kindString.toLowerCase()}{" "}
        <strong>{name}</strong>
        {!!implementedTypes.length &&
          implementedTypes.map((implementedType) => (
            <React.Fragment key={implementedType.id}>
              {" "}
              implements <TypePeeker {...implementedType} />
            </React.Fragment>
          ))}
        {!!extendedTypes.length &&
          extendedTypes.map((extendedType) => (
            <React.Fragment key={extendedType.id}>
              {" "}
              extends <TypePeeker {...extendedType} />
            </React.Fragment>
          ))}
      </div>

      {indexSignature.map(({ parameters, type }) => (
        <Block key={parameters[0].id}>
          [{parameters[0].name}: <TypePeeker {...parameters[0].type} />
          ]: <TypePeeker {...type} />;
        </Block>
      ))}

      {children
        .sort((a, b) => a.sources[0].line - b.sources[0].line)
        .map((child) => (
          <Block key={child.id}>
            <DisplayItem {...child} />
          </Block>
        ))}
    </div>
  );
};

export default DisplayInterface;
