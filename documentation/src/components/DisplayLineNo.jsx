import React from "react";
import styled from "styled-components";

const El = styled.a`
  position: relative;
  font-size: 0.8em;
`;

const DisplayLineNo = ({ fileName, line, character, children }) => {
  return (
    <El
      href={`https://github.com/stellar/js-stellar-wallets/tree/master/${fileName}#L${line}`}
      target="_blank"
    >
      {fileName} ({line}:{character}) ↗️
    </El>
  );
};
export default DisplayLineNo;
