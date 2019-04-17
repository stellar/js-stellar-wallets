import React from "react";
import ReactMarkdown from "react-markdown";

import { useStateValue } from "AppState";

import DisplayInterface from "components/DisplayInterface";
import DisplayMethod from "components/DisplayMethod";
import DisplayProperty from "components/DisplayProperty";

const DisplayItem = (params) => {
  const [{ itemsById }] = useStateValue();

  let item;

  switch (params.kindString) {
    case "Function":
    case "Method":
    case "Constructor":
      item = <DisplayMethod {...params} />;
      break;

    case "Property":
      item = <DisplayProperty {...params} />;
      break;

    case "Class":
    case "Interface":
    case "Object literal":
      item = <DisplayInterface {...params} />;
      break;

    case "Variable":
      if (params.type.type === "reference") {
        item = <DisplayItem {...itemsById[params.type.id]} />;
      } else {
        item = <pre>{JSON.stringify(params, null, 2)}</pre>;
      }
      break;

    default:
      item = <pre>{JSON.stringify(params, null, 2)}</pre>;
      break;
  }

  return (
    <div id={`item_${params.id}`}>
      {params.comment && (
        <>
          <ReactMarkdown source={params.comment.shortText} />
          <ReactMarkdown source={params.comment.text} />
        </>
      )}
      {item}
    </div>
  );
};

export default DisplayItem;
