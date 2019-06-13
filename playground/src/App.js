import React, { Component } from "react";
import styled from "styled-components";
import { GlobalStyle } from "@stellar/elements";

import { Data } from "@stellar/wallet-sdk";

import AccountDetails from "components/AccountDetails";
import KeyEntry from "components/KeyEntry";
import Offers from "components/Offers";
import Trades from "components/Trades";
import Transfers from "components/Transfers";

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
    const dataProvider = new Data.DataProvider({
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
