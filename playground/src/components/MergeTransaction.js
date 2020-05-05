import React, { Component } from "react";
import { StrKey } from "stellar-sdk";

import TransactionViewer from "components/TransactionViewer";

const STORAGE_KEY = "merge-transaction-destination";

class MergeTransaction extends Component {
  state = {
    destination: localStorage.getItem(STORAGE_KEY),
    tx: null,
  };

  render() {
    const { destination, tx } = this.state;

    const handleDestination = (ev) => {
      const dest = ev.target.value;
      if (StrKey.isValidEd25519PublicKey(dest)) {
        localStorage.setItem(STORAGE_KEY, dest);
      }
      this.setState({ destination: dest });
    };

    const handleGetTransaction = async () => {
      try {
        const trans = await this.props.dataProvider.getStripAndMergeAccountTransaction(
          destination,
        );
        this.setState({ tx: trans });
      } catch (e) {
        debugger;
      }
    };

    return (
      <div>
        <h3>Merge into another account</h3>

        <input type="text" value={destination} onChange={handleDestination} />

        {destination && (
          <button onClick={handleGetTransaction}>Run merge command</button>
        )}

        {tx && <TransactionViewer transaction={tx} />}
      </div>
    );
  }
}

export default MergeTransaction;
