import React from "react";
import styled from "styled-components";

const ListEl = styled.li`
  font-size: 0.9em;

  &:not(:last-child) {
    margin-bottom: 5px;
  }
`;

const Index = ({ itemsByKind }) => (
  <div>
    {Object.keys(itemsByKind).map((kind) => (
      <>
        <h3>{kind}</h3>

        {itemsByKind[kind] &&
          itemsByKind[kind]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((item) => (
              <ListEl>
                <a href={`#item_${item.id}`}>{item.name}</a>
              </ListEl>
            ))}
      </>
    ))}
  </div>
);

export default Index;
