import React from "react";
import styled from "styled-components";

import { getLink } from "helpers/getLink";

const El = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`;

const ListEl = styled.li`
  font-size: 0.9em;
  margin: 0;
  padding: 0;

  &:not(:last-child) {
    margin-bottom: 5px;
  }
`;

const AsideEl = styled.em`
  display: inline-block;
  font-style: normal;
  opacity: 0.5;
  text-decoration: none;
  width: 40px;
  text-align: center;
  margin-right: 5px;
  background: lightGray;
  font-size: 0.8em;
`;

const SHORT_NAME = {
  Function: "func",
  Method: "func",
  Constructor: "func",
  Variable: "var",
  Property: "prop",
  "Enumeration member": "enum",
  Class: "class",
  Interface: "interf",
  Enumeration: "enum",
  "Object literal": "obj",
  "Type alias": "type",
};

export const TableOfContents = ({ items }) => (
  <div>
    {Object.keys(items).map((kind) => (
      <React.Fragment key={kind}>
        <h4>{kind}</h4>

        <El>
          {items[kind] &&
            items[kind]
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((item) => (
                <ListEl key={item.id}>
                  <AsideEl>
                    {SHORT_NAME[item.kindString] || item.kindString}
                  </AsideEl>
                  <a href={getLink(item.id)}>{item.name}</a>
                </ListEl>
              ))}
        </El>
      </React.Fragment>
    ))}
  </div>
);
