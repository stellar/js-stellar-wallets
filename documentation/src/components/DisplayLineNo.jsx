import React from "react";

const DisplayLineNo = ({ fileName, line, character }) => (
  <a
    href={`https://github.com/stellar/js-stellar-wallets/tree/master/${fileName}#L${line}`}
    target="_blank"
  >
    {fileName} ({line}:{character})
  </a>
);

export default DisplayLineNo;
