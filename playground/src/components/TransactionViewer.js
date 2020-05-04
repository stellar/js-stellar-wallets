import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

import OperationViewer from "./OperationViewer";

export function getXDRFromTransaction(transaction) {
  const xdrBuffer = transaction.toEnvelope().toXDR();
  return xdrBuffer.toString("base64");
}

const El = styled.div``;

const PreEl = styled.div`
  max-height: 300px;
  overflow: auto;
`;

const PreHeaderEl = styled.div`
  padding: 10px 20px;
`;

const PreSubheaderEl = styled.div`
  padding: 10px 20px;
  font-size: 12px;
  line-height: 20px;
`;

const PreBodyEl = styled.div`
  padding: 0 20px;
`;

const DetailsEl = styled.div`
  font-size: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TransactionViewer = ({ transaction }) => {
  const { operations, memo } = transaction;

  const xdr = getXDRFromTransaction(transaction);

  const hasMemo = memo && memo._type && memo._value;

  const memoValue =
    // If it's binary, render as hex. Create a new array because otherwise it's
    // still a Uint8Array, which doesn't like holding string values.
    memo._value instanceof Uint8Array
      ? [...memo._value].map((x) => `0${x.toString(16)}`.substr(-2)).join("")
      : memo._value;

  return (
    <El>
      <PreEl>
        <PreHeaderEl>
          <h2>{operations.length} operation(s)</h2>
        </PreHeaderEl>
        <PreBodyEl>
          {operations.map((operation, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <OperationViewer {...operation} key={i} />
          ))}
        </PreBodyEl>
        <PreSubheaderEl>
          {!hasMemo && (
            <em>
              <>No memo attached!</>
            </em>
          )}
          {hasMemo && `Memo (${memo._type}): ${memoValue}`}
        </PreSubheaderEl>
      </PreEl>

      <DetailsEl>
        <p>Hash: {transaction.hash().toString("hex")}</p>

        <a
          href={`https://www.stellar.org/laboratory/#xdr-viewer?type=TransactionEnvelope&input=${encodeURIComponent(
            xdr,
          )}`}
          withIcon
          withUnderline
        >
          <>View in Stellar Laboratory</>
        </a>
      </DetailsEl>
    </El>
  );
};

TransactionViewer.propTypes = {
  transaction: PropTypes.shape({
    operations: PropTypes.arrayOf(PropTypes.object).isRequired,
    signatures: PropTypes.arrayOf(PropTypes.object).isRequired,
    source: PropTypes.string.isRequired,
    fee: PropTypes.number.isRequired,
    sequence: PropTypes.string.isRequired,
    memo: PropTypes.object,

    // functions
    hash: PropTypes.func,
    toEnvelope: PropTypes.func,
  }).isRequired,
};

export default TransactionViewer;
