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

      {indexSignature.map(({ parameters, type }) => (
        <Block>
          [{parameters[0].name}: <TypePeeker {...parameters[0].type} />
          ]: <TypePeeker {...type} />;
        </Block>
      ))}

      {children
        .sort((a, b) => a.sources[0].line - b.sources[0].line)
        .map((child) => (
          <Block>
            <DisplayItem {...child} />
          </Block>
        ))}

      {/* <pre>{JSON.stringify(params, null, 2)}</pre> */}
    </div>
  );
};

export default DisplayInterface;
