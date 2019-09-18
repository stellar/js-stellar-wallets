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
    authToken: null,
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
    const depositProvider = new WalletSdk.DepositProvider(url);

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
    const { dataProvider, keyManager } = this.props;

    const accountKey = dataProvider.getAccountKey();

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

            {assetCode &&
              (accountKey ? (
                <Button
                  theme={ButtonThemes.primary}
                  onClick={() =>
                    depositProvider
                      .fetchTransactions({
                        account: accountKey,
                        asset_code: assetCode,
                      })
                      .then((transactions) =>
                        this.setState({ transactions, transactionError: null }),
                      )
                      .catch((e) => this.setState({ transactionError: e }))
                  }
                >
                  Fetch deposits
                </Button>
              ) : (
                <p>Enter an account key before proceeding!</p>
              ))}

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
  keyManager: PropTypes.object.isRequired,
};

export default TransferProvider;
