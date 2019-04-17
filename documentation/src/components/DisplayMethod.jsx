import React from "react";

import TypePeeker from "components/TypePeeker";
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
                  {parameter.name}: <TypePeeker {...parameter.type} />
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
