import React from "react";

import DisplayMethod from "components/DisplayMethod";

const DisplayClass = ({ name, children }) => {
  return (
    <div>
      <h3>{name}</h3>
      {children.map((child) => (
        <DisplayMethod {...child} />
      ))}
    </div>
  );
};

export default DisplayClass;
