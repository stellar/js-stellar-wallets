import React, { Component } from "react";
import styled from "styled-components";
import { GlobalStyle } from "@stellar/elements";
import { DataProvider } from "@stellar/wallet-sdk";
import { Network } from "stellar-sdk";

import AccountDetails from "components/AccountDetails";
import Authorization from "components/Authorization";
import KeyEntry from "components/KeyEntry";
import Offers from "components/Offers";
import Trades from "components/Trades";
import Transfers from "components/Transfers";

Network.usePublicNetwork();

const El = styled.div`
  display: flex;
  font-size: 0.8em;
  line-height: 1.2em;
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
        <GlobalStyle />
        <h2>Transfers</h2>

        <Authorization />

        <h2>Key Data</h2>

        <KeyEntry onSetKey={this._setKey} />

        {dataProvider && !dataProvider.isValidKey() && (
          <p>That's an invalid key!</p>
        )}

        {dataProvider && dataProvider.isValidKey() && (
          <El>
            <AccountDetails dataProvider={dataProvider} />
            <div>
              <Transfers dataProvider={dataProvider} />
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
