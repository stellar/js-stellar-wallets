import React, { useState } from "react";
import styled from "styled-components";

import { useStateValue } from "AppState";

import DisplayInterface from "components/DisplayInterface";

const El = styled.a`
  position: relative;
`;

const InfoEl = styled.div`
  z-index: 10;
  position: absolute;
  top: 20px;
  left: 50%;

  padding: 10px;
  background: white;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.3);
`;

const DisplayType = ({ name, type, id }) => {
  const [isVisible, toggleVisibility] = useState(false);

  const [{ itemsById, itemsByName }] = useStateValue();

  if (!itemsById[id] && !itemsByName[name]) {
    return <span>{name || "any"}</span>;
  }

  if (itemsById[id]) {
    return (
      <El
        href={`#item_${id}`}
        onMouseEnter={() => toggleVisibility(true)}
        onMouseLeave={() => toggleVisibility(false)}
      >
        {name || "any"}

        {isVisible && (
          <InfoEl>
            <DisplayInterface {...itemsById[id]} />
          </InfoEl>
        )}
      </El>
    );
  }

  if (itemsByName[name]) {
    return (
      <El
        href={`#item_${itemsByName[name].id}`}
        onMouseEnter={() => toggleVisibility(true)}
        onMouseLeave={() => toggleVisibility(false)}
      >
        {name}
        {isVisible && (
          <InfoEl>
            <DisplayInterface {...itemsByName[name]} />
          </InfoEl>
        )}
      </El>
    );
  }
};

export default DisplayType;
