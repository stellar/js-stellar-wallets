import React from "react";
import styled from "styled-components";

import { getLink } from "helpers/getLink";

const ListEl = styled.li`
  font-size: 0.9em;

  &:not(:last-child) {
    margin-bottom: 5px;
  }
`;

export const TableOfContents = ({ itemsByKind }) => (
  <div>
    {Object.keys(itemsByKind).map((kind) => (
      <React.Fragment key={kind}>
        <h4>{kind}</h4>

        <ul>
          {itemsByKind[kind] &&
            itemsByKind[kind]
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((item) => (
                <ListEl key={item.id}>
                  <a href={getLink(item.id)}>{item.name}</a>
                </ListEl>
              ))}
        </ul>
      </React.Fragment>
    ))}
  </div>
);
