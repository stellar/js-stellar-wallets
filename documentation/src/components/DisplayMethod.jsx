import React from "react";

import DisplayLineNo from "components/DisplayLineNo";
import DisplayType from "components/DisplayType";

const DisplayMethod = ({ name, signatures = [], sources = [] }) => {
  return (
    <div>
      {!!signatures.length &&
        signatures.map(({ parameters = [] }, i) => (
          <p>
            {name}(
            {!!parameters.length &&
              parameters.map((parameter) => (
                <>
                  {parameter.name}: <DisplayType {...parameter.type} />
                  {i !== signatures.length - 1 && <>, </>}
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
