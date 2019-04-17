import React from "react";

import DisplayInterface from "components/DisplayInterface";
import DisplayMethod from "components/DisplayMethod";
import DisplayClass from "components/DisplayClass";
import DisplayProperty from "components/DisplayProperty";

const DisplayItem = (params) => {
  let item;

  switch (params.kindString) {
    case "Interface":
      item = <DisplayInterface {...params} />;
      break;

    case "Function":
    case "Method":
    case "Constructor":
      item = <DisplayMethod {...params} />;
      break;

    case "Property":
      item = <DisplayProperty {...params} />;
      break;

    case "Class":
      item = <DisplayClass {...params} />;
      break;

    default:
      item = <pre>{JSON.stringify(params, null, 2)}</pre>;
      break;
  }

  return <div id={`item_${params.id}`}>{item}</div>;
};

export default DisplayItem;
