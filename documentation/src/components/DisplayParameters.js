import React from "react";

import { TypePeeker } from "components/TypePeeker";

export const DisplayParameters = ({ parameters }) => {
  if (!parameters || !parameters.length) {
    return null;
  }
  return (
    <>
      {parameters.map((parameter, i) => (
        <React.Fragment key={parameter.id}>
          {parameter.name}
          {parameter.flags.isOptional && <>?</>}:{" "}
          <TypePeeker {...parameter.type} />
          {i !== parameters.length - 1 && <>, </>}
        </React.Fragment>
      ))}
    </>
  );
};
