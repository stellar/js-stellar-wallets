import React from "react";
import styled from "styled-components";

import TypePeeker from "components/TypePeeker";

const Highlighted = styled.span`
  background: yellow;
  margin-right: 20px;
`;

const DisplayProperty = ({
  flags,
  kindString,
  defaultValue,
  name,
  type = {},
}) => {
  // if this type is a union and one of the types is undefined,
  // mark this shit as OPTIONAL
  const isOptional =
    type.type === "union" &&
    !!type.types.filter((t) => t.name === "undefined").length;

  return (
    <div>
      {flags.isPublic && <>public </>}
      {flags.isPrivate && <>private </>}
      {name}
      {isOptional && "?"}:{" "}
      {kindString === "Enumeration member" ? (
        <span>{defaultValue}</span>
      ) : (
        <TypePeeker
          {...type}
          // provide the name here in case the type is a pointer to another obj
          name={type.name || name}
        />
      )}
    </div>
  );
};

export default DisplayProperty;
