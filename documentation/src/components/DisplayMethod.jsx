import React from "react";

import Semibold from "basics/Semibold";

import Comment from "components/Comment";
import TypePeeker from "components/TypePeeker";
import LinkToID from "components/LinkToID";

const DisplayMethod = (params) => {
  const { name, signatures = [], implementationOf, flags, ...rest } = params;
  return (
    <div>
      {!!signatures.length &&
        signatures.map(({ comment, parameters = [], type }) => (
          <>
            {comment && <Comment {...comment} />}
            {flags.isPrivate && <>private </>}
            <Semibold>{name}</Semibold>(
            {!!parameters.length &&
              parameters.map((parameter, i) => (
                <>
                  {parameter.name}
                  {parameter.flags.isOptional && <>?</>}:{" "}
                  <TypePeeker {...parameter.type} />
                  {i !== parameters.length - 1 && <>, </>}
                </>
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
          </>
        ))}

      {/* <pre>{JSON.stringify(params, null, 2)}</pre> */}
    </div>
  );
};

export default DisplayMethod;
