import React from "react";

import { Semibold } from "basics/Semibold";

import { Comment } from "components/Comment";
import { TypePeeker } from "components/TypePeeker";
import { LinkToID } from "components/LinkToID";

export const DisplayMethod = (params) => {
  const { name, signatures = [], implementationOf, flags } = params;
  return (
    <div>
      {!!signatures.length &&
        signatures.map(({ id, comment, parameters = [], type }) => (
          <React.Fragment key={`${name}_${id}`}>
            {comment && <Comment {...comment} />}
            {flags.isPrivate && <>private </>}
            <Semibold>{name}</Semibold>(
            {!!parameters.length &&
              parameters.map((parameter, i) => (
                <React.Fragment key={parameter.id}>
                  {parameter.name}
                  {parameter.flags.isOptional && <>?</>}:{" "}
                  <TypePeeker {...parameter.type} />
                  {i !== parameters.length - 1 && <>, </>}
                </React.Fragment>
              ))}
            )
            {type && (
              <>
                : <TypePeeker {...type} />
              </>
            )}
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
          </React.Fragment>
        ))}
    </div>
  );
};
