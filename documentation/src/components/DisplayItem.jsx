import React from "react";

// import DisplayInterface from "components/DisplayInterface";
import DisplayMethod from "components/DisplayMethod";
import DisplayClass from "components/DisplayClass";

const DisplayItem = (params) => {
  switch (params.kindString) {
    case "Function":
    case "Method":
      return <DisplayMethod {...params} />;

    case "Class":
      return <DisplayClass {...params} />;
    default:
      return <pre>{JSON.stringify(params, null, 2)}</pre>;
  }
};

export default DisplayItem;
