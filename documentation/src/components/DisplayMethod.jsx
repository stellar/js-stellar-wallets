import React from "react";

import DisplayLineNo from "components/DisplayLineNo";
import DisplayType from "components/DisplayType";

import Block from "basics/Block";

const DisplayMethod = ({
  name,
  signatures = [],
  sources = [],
  implementationOf,
  flags,
  ...rest
}) => {
  return (
    <div>
      {!!signatures.length &&
        signatures.map(({ parameters = [] }) => (
          <>
            {flags.isPublic && <>public </>}
            {flags.isPrivate && <>private </>}
            <DisplayLineNo {...sources[0]}>{name}</DisplayLineNo>(
            {!!parameters.length &&
              parameters.map((parameter, i) => (
                <>
                  {parameter.name}: <DisplayType {...parameter.type} />
                  {i !== parameters.length - 1 && <>, </>}
                </>
              ))}
            )
            {implementationOf && (
              <>
                implementationOf{" "}
                <a href={`#item_${implementationOf.id}`}>
                  {implementationOf.name}
                </a>
              </>
            )}
          </>
        ))}

      <Block>{JSON.stringify(rest)}</Block>
    </div>
  );
};

export default DisplayMethod;
