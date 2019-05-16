import React, { useState } from "react";
import styled from "styled-components";

import { useStateValue } from "AppState";

import { getLink } from "helpers/getLink";

import DisplayItem from "components/DisplayItem";

import Tooltip from "basics/Tooltip";

const El = styled.span`
  position: relative;
`;

const TypeEl = styled.span`
  color: darkBlue;
`;

const LabelEl = styled.a``;

const TypePeeker = ({
  name,
  type,
  elementType,
  types,
  typeArguments,
  id,
  value,
}) => {
  const [isVisible, toggleVisibility] = useState(false);

  const [{ itemsById, itemsByName }] = useStateValue();

  if (type === "stringLiteral") {
    return <span>"{value}"</span>;
  }

  if (type === "union") {
    // don't show "undefined" types because that's handled
    // by optionalness of the property
    return (
      <span>
        {types
          .filter((t) => t.name !== "undefined")
          .map((t, i, arr) => (
            <React.Fragment key={i}>
              <TypePeeker {...t} />
              {i !== arr.length - 1 && <> | </>}
            </React.Fragment>
          ))}
      </span>
    );
  }

  if (type === "array") {
    // don't show "undefined" types because that's handled
    // by optionalness of the property
    return (
      <span>
        <TypePeeker {...elementType} />
        []
      </span>
    );
  }

  if (typeArguments) {
    return (
      <El>
        <TypeEl>{name}</TypeEl>
        {"<"}
        {typeArguments.map((t, i, arr) => (
          <React.Fragment key={i}>
            <TypePeeker {...t} />
            {i !== arr.length - 1 && <>, </>}
          </React.Fragment>
        ))}
        {">"}
      </El>
    );
  }

  if (!itemsById[id] && !itemsByName[name]) {
    return <TypeEl>{name || "any"}</TypeEl>;
  }

  if (itemsById[id]) {
    return (
      <El
        onMouseEnter={() => toggleVisibility(true)}
        onMouseLeave={() => toggleVisibility(false)}
      >
        <LabelEl href={getLink(id)}>{name || "any"}</LabelEl>

        {isVisible && (
          <Tooltip>
            <DisplayItem {...itemsById[id]} />
          </Tooltip>
        )}
      </El>
    );
  }

  if (itemsByName[name]) {
    return (
      <El
        onMouseEnter={() => toggleVisibility(true)}
        onMouseLeave={() => toggleVisibility(false)}
      >
        <LabelEl>{name}</LabelEl>
        {isVisible && (
          <Tooltip>
            <DisplayItem {...itemsByName[name]} />
          </Tooltip>
        )}
      </El>
    );
  }
};

export default TypePeeker;
