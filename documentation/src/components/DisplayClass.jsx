import React from "react";

import DisplayLineNo from "components/DisplayLineNo";
import DisplayItem from "components/DisplayItem";
import DisplayType from "components/DisplayType";

import Block from "basics/Block";

const DisplayClass = ({
  name,
  children,
  sources,
  implementedTypes = [],
  ...rest
}) => {
  return (
    <div>
      <h3>
        class <DisplayLineNo {...sources[0]}>{name}</DisplayLineNo>
        {!!implementedTypes.length &&
          implementedTypes.map((implementedType) => (
            <>
              {" "}
              implements <DisplayType {...implementedType} />
            </>
          ))}
        {" {"}
      </h3>
      <Block>
        {children.map((child) => (
          <DisplayItem {...child} />
        ))}
      </Block>
    </div>
  );
};

export default DisplayClass;
