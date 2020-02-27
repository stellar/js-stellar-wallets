import React, { Component } from "react";
import PropTypes from "prop-types";
import Json from "react-json-view";
import * as WalletSdk from "@stellar/wallet-sdk";
import {
  Input,
  Button,
  ButtonThemes,
  Checkbox,
  Select,
} from "@stellar/elements";

class TransferProvider extends Component {
  state = {
    depositProvider: null,
    url: "",
    isTestnet: false,
    assetCode: "",

    transactions: null,
    transactionError: null,
    info: null,
  };

  componentDidMount() {
    const localUrl = localStorage.getItem("transferUrl");
    if (localUrl) {
      this.setState({ url: localUrl });
    }
  }

  _setUrl = (url) => {
    const depositProvider = new WalletSdk.DepositProvider(
      url,
      this.props.dataProvider.getAccountKey(),
    );

    this.setState({
      depositProvider,
    });

    localStorage.setItem("transferUrl", url);

    depositProvider.fetchInfo().then((info) => this.setState({ info }));
  };

  render() {
    const {
      depositProvider,
      url,
      info,
      isTestnet,
      assetCode,
      transactions,
      transactionError,
    } = this.state;
    const { authToken } = this.props;

    return (
      <div>
        <h2>Deposit provider</h2>

        {!depositProvider && (
          <>
            <label>
              Transfer URL root:
              <Input
                type="text"
                value={url}
                onChange={(ev) => this.setState({ url: ev.target.value })}
              />
            </label>
            <Checkbox
              label="Is Testnet"
              checked={isTestnet}
              onChange={() => this.setState({ isTestnet: !isTestnet })}
            />
            <Button
              theme={ButtonThemes.primary}
              onClick={() => this._setUrl(url)}
            >
              Submit
            </Button>
          </>
        )}

        {depositProvider && info && (
          <>
            <h2>Token Info</h2>

            <Json src={info} />

            <h2>Transaction History</h2>

            <label>
              Get transactions for asset:{" "}
              <Select
                value={assetCode}
                onChange={(ev) => this.setState({ assetCode: ev.target.value })}
              >
                <option>-- Select one --</option>
                {Object.keys(info.deposit).map((code) => (
                  <option value={code} key={code}>
                    {code}
                  </option>
                ))}
              </Select>
            </label>

            {assetCode && !authToken && (
              <p>Fetch an auth token above before continuing!</p>
            )}

            {assetCode && authToken && (
              <Button
                theme={ButtonThemes.primary}
                onClick={() => {
                  if (authToken) {
                    depositProvider.setAuthToken(authToken);
                  }
                  depositProvider
                    .fetchTransactions({
                      asset_code: assetCode,
                    })
                    .then((transactions) =>
                      this.setState({ transactions, transactionError: null }),
                    )
                    .catch((e) =>
                      this.setState({ transactionError: e.toString() }),
                    );
                }}
              >
                Fetch deposits
              </Button>
            )}

            {transactionError && <p>Error: {transactionError}</p>}
            {transactions && <Json src={transactions} />}
          </>
        )}
      </div>
    );
  }
}

TransferProvider.propTypes = {
  dataProvider: PropTypes.object.isRequired,
  authToken: PropTypes.string,
};

export default TransferProvider;
