import React from "react";

import DisplayLineNo from "components/DisplayLineNo";
import DisplayItem from "components/DisplayItem";
import DisplayType from "components/DisplayType";

import Block from "basics/Block";

const DisplayProperty = ({ flags, name, type, sources, ...rest }) => {
  return (
    <div>
      {flags.isPublic && <>public </>}
      {flags.isPrivate && <>private </>}
      <DisplayLineNo {...sources[0]}>{name}</DisplayLineNo>:{" "}
      <DisplayType {...type} />
      <p>{JSON.stringify(rest)}</p>
    </div>
  );
};

export default DisplayProperty;
