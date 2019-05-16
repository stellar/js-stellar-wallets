import React from "react";
import styled from "styled-components";

import Comment from "components/Comment";
import DisplayInterface from "components/DisplayInterface";
import DisplayMethod from "components/DisplayMethod";
import DisplayProperty from "components/DisplayProperty";
import DisplayLineNo from "components/DisplayLineNo";
import DisplayType from "components/DisplayType";

const HeaderEl = styled.div`
  background: #dfdfdf;
  display: flex;
  justify-content: space-between;
  padding: 10px 20px;
`;

const NameEl = styled.h2`
  margin: 0;
  padding: 0;
  font-size: 16px;
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
    <>
      {isRootElement && (
        <HeaderEl id={`item_${params.id}`}>
          <NameEl>{params.name}</NameEl>

          {params.sources && <DisplayLineNo {...params.sources[0]} />}
        </HeaderEl>
      )}

      <El>
        {params.comment && <Comment {...params.comment} />}

        {item}
      </El>
    </>
  );
};

export default DisplayItem;
