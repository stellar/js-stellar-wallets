import React, { useState } from "react";
import styled from "styled-components";

import { useStateValue } from "AppState";

import DisplayItem from "components/DisplayItem";
import LinkToID from "components/LinkToID";

import Tooltip from "basics/Tooltip";

const El = styled(LinkToID)`
  position: relative;
`;

const TypePeeker = ({ name, type, types, typeArguments, id }) => {
  const [isVisible, toggleVisibility] = useState(false);

  const [{ itemsById, itemsByName }] = useStateValue();

  if (type === "union") {
    // don't show "undefined" types because that's handled
    // by optionalness of the property
    return (
      <span>
        {types
          .filter((t) => t.name !== "undefined")
          .map((t, i) => (
            <>
              <TypePeeker {...t} />
              {i !== types.length - 1 && <> | </>}
            </>
          ))}
      </span>
    );
  }

  if (typeArguments) {
    return (
      <>
        {name}
        {"<"}
        {typeArguments.map((t, i) => (
          <>
            <TypePeeker {...t} />
            {i !== typeArguments.length - 1 && <>, </>}
          </>
        ))}
        {">"}
      </>
    );
  }

  if (!itemsById[id] && !itemsByName[name]) {
    return <span>{name || "any"}</span>;
  }

  if (itemsById[id]) {
    return (
      <El
        id={id}
        onMouseEnter={() => toggleVisibility(true)}
        onMouseLeave={() => toggleVisibility(false)}
      >
        {name || "any"}

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
        id={itemsByName[name].id}
        onMouseEnter={() => toggleVisibility(true)}
        onMouseLeave={() => toggleVisibility(false)}
      >
        {name}
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
