import React from "react";
import styled from "styled-components";

import DisplayType from "components/DisplayType";

const Highlighted = styled.span`
  background: yellow;
  margin-right: 20px;
`;

const DisplayProperty = ({ flags, name, type }) => {
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
      <DisplayType
        {...type}
        // provide the name here in case the type is a pointer to another obj
        name={type.name || name}
      />
      <p>
        <Highlighted>{JSON.stringify(type)}</Highlighted>
      </p>
    </div>
  );
};

export default DisplayProperty;
