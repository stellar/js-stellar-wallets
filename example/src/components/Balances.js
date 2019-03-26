import React, { Component } from "react";

import { DataProvider } from "../js-stellar-wallets/";

class Balances extends Component {
  state = {
    key: "GCCQAELN4NBN37T5WT5JYIASANP7YRLHNH27E5WCRRVDY5SPIFA76MIA",
    dataProvider: null,
    balances: null,
    err: null,
    updateTimes: [],
    streamEnder: null,
  };

  _fetchBalances = () => {
    const dataProvider = new DataProvider({
      serverUrl: "https://horizon.stellar.org",
      accountOrKey: this.state.key,
    });

    // if there was a previous data  provider, kill the

    if (this.state.streamEnder) {
      this.state.streamEnder();
    }

    this.setState({
      dataProvider,
      balances: null,
      err: null,
      updateTimes: [],
      streamEnder: null,
    });

    const streamEnder = dataProvider.watchBalances({
      onMessage: (balances) => {
        this.setState({
          balances,
          updateTimes: [...this.state.updateTimes, new Date()],
        });
      },
      onError: (err) => {
        this.setState({ err });
        streamEnder();
      },
    });

    this.setState({
      streamEnder,
    });
  };

  render() {
    const { key, dataProvider, balances, err, updateTimes } = this.state;
    return (
      <div>
        <form
          onSubmit={(ev) => {
            ev.preventDefault();

            this._fetchBalances();
          }}
        >
          <label>
            Public key
            <input
              type="text"
              value={key}
              onChange={(ev) => this.setState({ key: ev.target.value })}
            />
            <button>Fetch balances</button>
          </label>
        </form>

        {dataProvider && dataProvider.isValidKey() && <p>Key is valid</p>}

        <ul>
          {updateTimes.map((time) => (
            <li key={time.toString()}>{time.toString()}</li>
          ))}
        </ul>

        {balances && <pre>{JSON.stringify(balances, null, 2)}</pre>}
        {err && <p>Error: {err.toString()}</p>}
      </div>
    );
  }
}

export default Balances;
