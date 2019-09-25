import React, { Component } from "react";
import styled from "styled-components";
import { GlobalStyle } from "@stellar/elements";
import * as WalletSdk from "@stellar/wallet-sdk";
import StellarSdk from "stellar-sdk";

import AccountDetails from "components/AccountDetails";
import KeyEntry from "components/KeyEntry";
import Offers from "components/Offers";
import Trades from "components/Trades";
import Transfers from "components/Transfers";
import TransferProvider from "components/TransferProvider";

const El = styled.div`
  display: flex;
  font-size: 0.8em;
  line-height: 1.2em;
`;

class App extends Component {
  state = {
    dataProvider: null,
    authToken: null,
    isTestnet: false,
  };

  componentDidMount() {
    window.StellarSdk = StellarSdk;
    window.WalletSdk = WalletSdk;
  }

  _setKey = (publicKey, isTestnet) => {
    const dataProvider = new WalletSdk.DataProvider({
      serverUrl: isTestnet
        ? "https://horizon-testnet.stellar.org/"
        : "https://horizon.stellar.org",
      accountOrKey: publicKey,
    });

    this.setState({
      dataProvider,
    });
  };

  render() {
    const { dataProvider, authToken } = this.state;

    return (
      <div>
        <GlobalStyle />

        <h2>Key Data</h2>

        <KeyEntry
          onSetKey={this._setKey}
          onGetAuthToken={(authToken) => this.setState({ authToken })}
        />

        {dataProvider && !dataProvider.isValidKey() && (
          <p>That's an invalid key!</p>
        )}

        {dataProvider && dataProvider.isValidKey() && (
          <>
            <h2>Transfers</h2>

            <TransferProvider
              dataProvider={dataProvider}
              authToken={authToken}
            />

            <El>
              <AccountDetails dataProvider={dataProvider} />
              <div>
                <Transfers dataProvider={dataProvider} />
                <Offers dataProvider={dataProvider} />
                <Trades dataProvider={dataProvider} />
              </div>
            </El>
          </>
        )}
      </div>
    );
  }
}

export default App;
