import React from "react";

import TypePeeker from "components/TypePeeker";

function getType(type) {
  switch (type.type) {
    case "array": {
      return (
        <React.Fragment key={type.elementType.id}>
          <TypePeeker {...type.elementType} />
          []
        </React.Fragment>
      );
    }

    case "union": {
      return type.types.reduce((memo, t, i) => {
        if (i === type.types.length - 1) {
          return [...memo, getType(t)];
        }

        return [
          ...memo,
          <React.Fragment key={`type_${i}`}>{getType(t)}</React.Fragment>,
          <React.Fragment key={`sep_${i}`}> | </React.Fragment>,
        ];
      }, []);
    }

    default: {
      return <TypePeeker {...type} />;
    }
  }
}

const DisplayType = ({ name, type }) => (
  <div>
    type <strong>{name}</strong> = {getType(type)}
  </div>
);

export default DisplayType;
