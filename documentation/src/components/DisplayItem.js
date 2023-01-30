import React from "react";
import styled from "styled-components";
import Json from "react-json-view";

import { Comment } from "components/Comment";
import { DisplayInterface } from "components/DisplayInterface";
import { DisplayMethod } from "components/DisplayMethod";
import { DisplayProperty } from "components/DisplayProperty";
import { DisplayType } from "components/DisplayType";

const HeaderEl = styled.div`
  background: #dfdfdf;
  display: flex;
  justify-content: flex-start;
  align-items: flex-end;
  padding: 10px 20px;
`;

const NameEl = styled.h2`
  margin: 0;
  padding: 0;
  font-size: 16px;
  margin-right: 15px;
`;

const LineEl = styled.div`
  font-size: 0.8em;
`;

const LineLinkEl = styled.a`
  margin-left: 15px;
`;

const ChildEl = styled.div`
  position: relative;
`;

const RootEl = styled.div`
  position: relative;
  margin-bottom: 1.5%;
  padding: 20px;
  background: #f3f3f3;
`;

export const DisplayItem = ({ isRootElement, ...params }) => {
  let item;

  const El = isRootElement ? RootEl : ChildEl;

  switch (params.kindString) {
    case "Function":
    case "Method":
    case "Constructor":
      item = <DisplayMethod {...params} />;
      break;

    case "Variable":
    case "Property":
    case "Enumeration Member":
      item = <DisplayProperty {...params} />;
      break;

    case "Class":
    case "Interface":
    case "Enumeration":
    case "Object literal":
      item = <DisplayInterface {...params} />;
      break;

    case "Type alias":
      item = <DisplayType {...params} />;
      break;

    default:
      item = <Json src={params} />;
      break;
  }

  const { id, name, sources, comment } = params;

  return (
    <>
      {isRootElement && (
        <HeaderEl id={`item_${id}`}>
          <NameEl>
            {name} ({params.kindString})
          </NameEl>

          {sources && (
            <LineEl>
              {sources[0].fileName}
              <LineLinkEl
                href={`https://github.com/stellar/js-stellar-wallets/tree/master/${sources[0].fileName}#L${sources[0].line}`}
                target="_blank"
              >
                ({sources[0].line}:{sources[0].character}) ↗️
              </LineLinkEl>
            </LineEl>
          )}
        </HeaderEl>
      )}

      <El>
        {comment && <Comment {...comment} />}

        {item}
      </El>
    </>
  );
};
