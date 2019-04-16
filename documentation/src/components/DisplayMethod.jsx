import React from "react";

const DisplayMethod = ({ name, signatures = [], sources = [] }) => {
  return (
    <div>
      <h4>
        {name} - {signatures.length}
      </h4>

      {sources.map((source) => (
        <p>
          {source.fileName} - {source.line}:{source.character}
        </p>
      ))}
      {signatures.map(({ name, parameters }) => (
        <>
          <h5>{name}</h5>
          <pre>{JSON.stringify(parameters, null, 2)}</pre>
        </>
      ))}
    </div>
  );
};

export default DisplayMethod;
