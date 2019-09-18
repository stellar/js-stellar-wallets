import React, { Component } from "react";
import PropTypes from "prop-types";
import Json from "react-json-view";
import * as WalletSdk from "@stellar/wallet-sdk";
import { Input, Button, ButtonThemes, Checkbox } from "@stellar/elements";

class TransferProvider extends Component {
  state = {
    depositProvider: null,
    url: "",
    isTestnet: false,
    assetCode: "",
    transactions: null,
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
    } = this.state;
    const { accountKey } = this.props;
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

        {depositProvider && (
          <>
            {info && (
              <>
                <h2>Supported tokens:</h2>
                <Json src={info} />
              </>
            )}

            <label>
              Get transactions for asset:
              <Input
                type="text"
                value={assetCode}
                onChange={(ev) => this.setState({ assetCode: ev.target.value })}
              />
            </label>

            {assetCode && (
              <Button
                theme={ButtonThemes.primary}
                onClick={() =>
                  depositProvider
                    .fetchTransactions({
                      account: accountKey,
                      asset_code: assetCode,
                    })
                    .then((transactions) => this.setState({ transactions }))
                }
              >
                Fetch deposits
              </Button>
            )}

            {transactions && <Json src={transactions} />}
          </>
        )}
      </div>
    );
  }
}

TransferProvider.propTypes = {
  accountKey: PropTypes.string,
};

export default TransferProvider;
