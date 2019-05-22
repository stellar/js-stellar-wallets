import React from "react";

import { Semibold } from "basics/Semibold";

import { Comment } from "components/Comment";
import { DisplayParameters } from "components/DisplayParameters";
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
            <DisplayParameters parameters={parameters} />)
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
