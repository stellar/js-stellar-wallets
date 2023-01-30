import React from "react";

import { Semibold } from "basics/Semibold";

import { TypePeeker } from "components/TypePeeker";

export const DisplayProperty = ({
  flags,
  kindString,
  defaultValue,
  name,
  type = {},
}) => {
  // if this type is a union and one of the types is undefined,
  // mark this shit as OPTIONAL
  const isOptional =
    type.type === "union" &&
    !!type.types.filter((t) => t.name === "undefined").length;

  return (
    <div>
      {flags.isPublic && <>public </>}
      {flags.isPrivate && <>private </>}
      <Semibold>{name}</Semibold>
      {isOptional && "?"}:{" "}
      {kindString === "Enumeration Member" ? (
        <span>"{type.value}"</span>
      ) : (
        <TypePeeker
          {...type}
          // provide the name here in case the type is a pointer to another obj
          name={type.name || name}
        />
      )}
    </div>
  );
};
