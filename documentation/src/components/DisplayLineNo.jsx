import React from "react";

const DisplayLineNo = ({ fileName, line, character, children }) => (
  <a
    href={`https://github.com/stellar/js-stellar-wallets/tree/master/${fileName}#L${line}`}
    target="_blank"
  >
    {children}
    {!children && (
      <>
        {fileName} ({line}:{character})
      </>
    )}
  </a>
);

export default DisplayLineNo;
