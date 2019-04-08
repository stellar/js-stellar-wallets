import React, { Component } from "react";
import styled from "styled-components";

import { DataProvider } from "./js-stellar-wallets/";

import AccountDetails from "./components/AccountDetails";
import Offers from "./components/Offers";
import Trades from "./components/Trades";

const El = styled.div`
  display: flex;
`;

class App extends Component {
  state = {
    keyInput: "GCCQAELN4NBN37T5WT5JYIASANP7YRLHNH27E5WCRRVDY5SPIFA76MIA",
    dataProvider: null,
  };

  _setKey = (publicKey) => {
    const dataProvider = new DataProvider({
      serverUrl: "https://horizon.stellar.org",
      accountOrKey: publicKey,
    });

    this.setState({
      dataProvider,
    });
  };

  render() {
    const { keyInput, dataProvider } = this.state;

    return (
      <div>
        <form
          onSubmit={(ev) => {
            ev.preventDefault();
            this._setKey(keyInput);
          }}
        >
          <label>
            Public key
            <input
              type="text"
              value={keyInput}
              onChange={(ev) => this.setState({ keyInput: ev.target.value })}
            />
            <button>Set key</button>
          </label>
        </form>

        {dataProvider && !dataProvider.isValidKey() && (
          <p>That's an invalid key!</p>
        )}

        {dataProvider && dataProvider.isValidKey() && (
          <El>
            <AccountDetails dataProvider={dataProvider} />
            <div>
              <Offers dataProvider={dataProvider} />
              <Trades dataProvider={dataProvider} />
            </div>
          </El>
        )}
      </div>
    );
  }
}

export default App;
