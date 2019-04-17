import React from "react";
import { type } from "os";

import TypePeeker from "components/TypePeeker";

function getType(type) {
  switch (type.type) {
    case "array": {
      return (
        <>
          <TypePeeker {...type.elementType} />
          []
        </>
      );
    }

    case "union": {
      return type.types.reduce((memo, t, i) => {
        if (i === type.types.length - 1) {
          return [...memo, getType(t)];
        }

        return [...memo, getType(t), <> | </>];
      }, []);
      // return <pre>{JSON.stringify(type, null, 2)}</pre>;
    }

    default: {
      return <TypePeeker {...type} />;
    }
  }
}

const DisplayType = ({ name, type, ...rest }) => {
  let value;

  return (
    <div>
      type <strong>{name}</strong> = {getType(type)}
    </div>
  );
};

export default DisplayType;
