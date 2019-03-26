import React, { Component } from "react";

import { DataProvider } from "./js-stellar-wallets/";

class App extends Component {
  state = {
    key: "GCCQAELN4NBN37T5WT5JYIASANP7YRLHNH27E5WCRRVDY5SPIFA76MIA",
    dataProvider: null,
    balances: null,
    err: null,
    updateTimes: [],
  };

  _fetchBalances = () => {
    const dataProvider = new DataProvider({
      serverUrl: "https://horizon.stellar.org",
      accountOrKey: this.state.key,
    });

    this.setState({
      dataProvider,
      balances: null,
      err: null,
      updateTimes: [],
    });

    if (dataProvider.isValidKey()) {
      dataProvider.watchBalances({
        onMessage: (balances) => {
          this.setState({
            balances,
            updateTimes: [...this.state.updateTimes, new Date()],
          });
        },
        onError: (err) => {
          this.setState({ err });
        },
      });
    }
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
        {err && <p>Error: {err}</p>}
      </div>
    );
  }
}

export default App;
