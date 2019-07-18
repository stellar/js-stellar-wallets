import React, { Component } from "react";
import styled from "styled-components";
import Json from "react-json-view";

import { DepositProvider } from "@stellar/wallet-sdk";

import AuthCurrency from "./AuthCurrency";

const El = styled.div`
  display: flex;
`;

class Authorization extends Component {
  state = {
    depositProvider: null,
    depositInfo: null,
    error: null,
  };

  async componentDidMount() {
    const depositProvider = new DepositProvider(
      "https://transfer-dot-jewel-api-dev.appspot.com",
    );

    depositProvider.setBearerToken("testtesttest");

    this.setState({ depositProvider });

    try {
      const res = await depositProvider.fetchSupportedAssets();
      this.setState({ depositInfo: res });
    } catch (e) {
      this.setState({ error: `fetchSupportedAssets: ${e.toString()}` });
    }
  }

  render() {
    const { depositInfo, depositProvider } = this.state;
    const account = "GCKM4UPHDEDDFRAR3DWQTUYIFDXB5JG4ARVI56RFEKUEBLTTPRT6AXHA";

    if (!depositInfo) {
      return <div>Loading...</div>;
    }

    return (
      <El>
        <Json src={depositInfo} />

        <div>
          {Object.keys(depositInfo).map((currency) => (
            <AuthCurrency
              depositProvider={depositProvider}
              key={currency}
              account={account}
              {...depositInfo[currency]}
            />
          ))}
        </div>
      </El>
    );
  }
}

export default Authorization;
