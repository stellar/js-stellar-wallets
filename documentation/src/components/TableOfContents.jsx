import React from "react";
import styled from "styled-components";

import { getLink } from "helpers/getLink";

const ListEl = styled.li`
  font-size: 0.9em;

  &:not(:last-child) {
    margin-bottom: 5px;
  }
`;

const TableOfContents = ({ itemsByKind }) => (
  <div>
    {Object.keys(itemsByKind).map((kind) => (
      <React.Fragment key={kind}>
        <h3>{kind}</h3>

        {itemsByKind[kind] &&
          itemsByKind[kind]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((item) => (
              <ListEl key={item.id}>
                <a href={getLink(item.id)}>{item.name}</a>
              </ListEl>
            ))}
      </React.Fragment>
    ))}
  </div>
);

export default TableOfContents;
