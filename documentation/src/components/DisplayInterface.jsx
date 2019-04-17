import React from "react";

import DisplayLineNo from "components/DisplayLineNo";
import DisplayItem from "components/DisplayItem";
import DisplayType from "components/DisplayType";

import Block from "basics/Block";

const DisplayInterface = ({
  kindString,
  name,
  children = [],
  sources,
  extendedTypes = [],
  implementedTypes = [],
  ...rest
}) => {
  return (
    <div>
      <h5>
        {kindString.toLowerCase()}{" "}
        <DisplayLineNo {...sources[0]}>{name}</DisplayLineNo>
        {!!extendedTypes.length &&
          extendedTypes.map((extendedType) => (
            <>
              {" "}
              extends <DisplayType {...extendedType} />
            </>
          ))}
        {" {"}
      </h5>
      <Block>
        <p>{JSON.stringify(rest)}</p>

        {children.map((child) => (
          <DisplayItem {...child} />
        ))}
      </Block>
      <h5>{"}"}</h5>
    </div>
  );
};

export default DisplayInterface;
