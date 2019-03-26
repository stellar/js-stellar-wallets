import React, { Component } from "react";

import { DataProvider } from "../js-stellar-wallets/";

class Balances extends Component {
  state = {
    key: "GCCQAELN4NBN37T5WT5JYIASANP7YRLHNH27E5WCRRVDY5SPIFA76MIA",
    dataProvider: null,
    offers: null,
    err: null,
    updateTimes: [],
    streamEnder: null,
  };

  componentWillUnmount() {
    if (this.state.streamEnder) {
      this.state.streamEnder();
    }
  }

  _fetchOffers = async () => {
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
      offers: null,
      err: null,
      updateTimes: [],
      streamEnder: null,
    });

    const offers = await dataProvider.fetchOpenOffers();

    this.setState({ offers });
  };

  render() {
    const { key, dataProvider, offers, err, updateTimes } = this.state;
    return (
      <div>
        <form
          onSubmit={(ev) => {
            ev.preventDefault();

            this._fetchOffers();
          }}
        >
          <label>
            Public key
            <input
              type="text"
              value={key}
              onChange={(ev) => this.setState({ key: ev.target.value })}
            />
            <button>Fetch offers</button>
          </label>
        </form>

        {dataProvider && dataProvider.isValidKey() && <p>Key is valid</p>}

        <ul>
          {updateTimes.map((time) => (
            <li key={time.toString()}>{time.toString()}</li>
          ))}
        </ul>

        {offers && <pre>{JSON.stringify(offers, null, 2)}</pre>}
        {err && <p>Error: {err.toString()}</p>}
      </div>
    );
  }
}

export default Balances;
