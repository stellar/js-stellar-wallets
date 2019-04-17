import React from "react";
import ReactMarkdown from "react-markdown";
import styled from "styled-components";

import DisplayInterface from "components/DisplayInterface";
import DisplayMethod from "components/DisplayMethod";
import DisplayProperty from "components/DisplayProperty";
import DisplayLineNo from "components/DisplayLineNo";
import DisplayType from "components/DisplayType";

const ChildEl = styled.div`
  position: relative;
`;

const RootEl = styled.div`
  position: relative;
  margin-bottom: 1.5%;
  border: 1px solid black;
  padding: 10px;
  vertical-align: top;
`;

const LineNoEl = styled.div`
  position: absolute;
  top: 0;
  right: 0;
`;

const CommentEl = styled.div`
  margin-right: 300px;
`;

const DisplayItem = ({ isRootElement, ...params }) => {
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
    case "Enumeration member":
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
      item = <pre>{JSON.stringify(params, null, 2)}</pre>;
      break;
  }

  return (
    <El id={isRootElement ? `item_${params.id}` : null}>
      {isRootElement && params.sources && (
        <LineNoEl>
          <DisplayLineNo {...params.sources[0]} />
        </LineNoEl>
      )}

      {params.comment && (
        <CommentEl>
          <ReactMarkdown source={params.comment.shortText} />
          <ReactMarkdown source={params.comment.text} />
        </CommentEl>
      )}
      {item}
    </El>
  );
};

export default DisplayItem;
