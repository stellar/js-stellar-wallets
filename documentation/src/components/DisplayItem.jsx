import React from "react";

import DisplayInterface from "components/DisplayInterface";
import DisplayMethod from "components/DisplayMethod";
import DisplayProperty from "components/DisplayProperty";

const DisplayItem = (params) => {
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
      item = <DisplayInterface {...params} />;
      break;

    default:
      item = <pre>{JSON.stringify(params, null, 2)}</pre>;
      break;
  }

  return (
    <div id={`item_${params.id}`}>
      {params.comment && (
        <>
          <p>{params.comment.shortText}</p>
          <p>{params.comment.text}</p>
        </>
      )}
      {item}
    </div>
  );
};

export default DisplayItem;
