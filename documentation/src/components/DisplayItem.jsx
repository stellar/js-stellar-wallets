import React from "react";
import ReactMarkdown from "react-markdown";
import styled from "styled-components";

import Comment from "basics/Comment";

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
  padding: 20px;
  background: #f3f3f3;
`;

const LineNoEl = styled.div`
  position: absolute;
  top: 0;
  right: 0;
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
      {params.comment && (
        <Comment>
          <ReactMarkdown source={params.comment.shortText} />
          <ReactMarkdown source={params.comment.text} />
        </Comment>
      )}

      {isRootElement && params.sources && (
        <LineNoEl>
          <DisplayLineNo {...params.sources[0]} />
        </LineNoEl>
      )}
      {item}
    </El>
  );
};

export default DisplayItem;
