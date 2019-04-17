import React from "react";
import ReactMarkdown from "react-markdown";

import Comment from "basics/Comment";
import Semibold from "basics/Semibold";

import TypePeeker from "components/TypePeeker";
import LinkToID from "components/LinkToID";

const DisplayMethod = (params) => {
  const { name, signatures = [], implementationOf, flags, ...rest } = params;
  return (
    <div>
      {!!signatures.length &&
        signatures.map(({ comment, parameters = [], type }) => (
          <>
            {flags.isPrivate && <>private </>}
            <Semibold>{name}</Semibold>(
            {!!parameters.length &&
              parameters.map((parameter, i) => (
                <>
                  {parameter.name}: <TypePeeker {...parameter.type} />
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
            {comment && (
              <Comment>
                <ReactMarkdown source={comment.shortText} />
                <ReactMarkdown source={comment.text} />
              </Comment>
            )}
          </>
        ))}

      {/* <pre>{JSON.stringify(params, null, 2)}</pre> */}
    </div>
  );
};

export default DisplayMethod;
