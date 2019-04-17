import React from "react";

import DisplayType from "components/DisplayType";
import LinkToID from "components/LinkToID";

const DisplayMethod = ({
  name,
  signatures = [],
  sources = [],
  implementationOf,
  flags,
}) => {
  return (
    <div>
      {!!signatures.length &&
        signatures.map(({ parameters = [] }) => (
          <>
            {flags.isPrivate && <>private </>}
            {name}(
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
                {" "}
                (See also{" "}
                <LinkToID id={implementationOf.id}>
                  {implementationOf.name}
                </LinkToID>
                )
              </>
            )}
          </>
        ))}
    </div>
  );
};

export default DisplayMethod;
