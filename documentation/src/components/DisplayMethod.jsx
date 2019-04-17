import React from "react";

import DisplayLineNo from "components/DisplayLineNo";
import DisplayType from "components/DisplayType";

const DisplayMethod = ({ name, signatures = [], sources = [] }) => {
  return (
    <div>
      {!!signatures.length &&
        signatures.map(({ parameters = [] }) => (
          <p>
            {name}(
            {!!parameters.length &&
              parameters.map((parameter, i) => (
                <>
                  {parameter.name}: <DisplayType {...parameter.type} />
                  {i !== parameters.length - 1 && <>, </>}
                </>
              ))}
            ) =>
            {sources.map((source) => (
              <DisplayLineNo {...source} />
            ))}
          </p>
        ))}
    </div>
  );
};

export default DisplayMethod;
