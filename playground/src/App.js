import React, { Component } from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import styled from "styled-components";
import { GlobalStyle } from "@stellar/elements";
import * as WalletSdk from "@stellar/wallet-sdk";
import StellarSdk from "stellar-sdk";

import AccountDetails from "components/AccountDetails";
import KeyEntry from "components/KeyEntry";
import Offers from "components/Offers";
import Trades from "components/Trades";
import Payments from "components/Payments";
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
      <Router>
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
            <div>
              <nav>
                <ul>
                  <li>
                    <Link to="/">Account</Link>
                  </li>
                  <li>
                    <Link to="/transfers">Transfers</Link>
                  </li>
                  <li>
                    <Link to="/payments">Payments</Link>
                  </li>
                  <li>
                    <Link to="/offers">Offers</Link>
                  </li>
                  <li>
                    <Link to="/trades">Trades</Link>
                  </li>
                </ul>
              </nav>

              <Switch>
                <Route path="/transfers">
                  <TransferProvider
                    dataProvider={dataProvider}
                    authToken={authToken}
                  />
                </Route>
                <Route path="/payments">
                  <Payments dataProvider={dataProvider} />
                </Route>
                <Route path="/">
                  <AccountDetails dataProvider={dataProvider} />
                </Route>
                <Route path="/offers">
                  <Offers dataProvider={dataProvider} />
                </Route>
                <Route path="/trades">
                  <Trades dataProvider={dataProvider} />
                </Route>
              </Switch>
            </div>
          )}
        </div>
      </Router>
    );
  }
}

export default App;
