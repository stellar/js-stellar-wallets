import React from "react";

import DisplayLineNo from "components/DisplayLineNo";
import DisplayType from "components/DisplayType";

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
