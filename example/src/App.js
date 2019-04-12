import React, { Component } from "react";
import styled from "styled-components";

import { DataProvider } from "js-stellar-wallets";

import AccountDetails from "components/AccountDetails";
import KeyEntry from "components/KeyEntry";
import Offers from "components/Offers";
import Trades from "components/Trades";

const El = styled.div`
  display: flex;
`;

class App extends Component {
  state = {
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
    const { dataProvider } = this.state;

    return (
      <div>
        <KeyEntry onSetKey={this._setKey} />

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
