import React from "react";
import styled from "styled-components";

import DisplayLineNo from "components/DisplayLineNo";
import DisplayType from "components/DisplayType";

const Highlighted = styled.span`
  background: yellow;
  margin-right: 20px;
`;

const DisplayProperty = ({ flags, name, type, sources, ...rest }) => {
  return (
    <div>
      {flags.isPublic && <>public </>}
      {flags.isPrivate && <>private </>}
      <DisplayLineNo {...sources[0]}>{name}</DisplayLineNo>:{" "}
      <DisplayType
        {...type}
        // provide the name here in case the type is a pointer to another obj
        name={type.name || name}
      />
      <p>
        <Highlighted>{JSON.stringify(type)}</Highlighted>
        <Highlighted>{JSON.stringify(rest)}</Highlighted>
      </p>
    </div>
  );
};

export default DisplayProperty;
