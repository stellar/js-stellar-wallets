import React, { Component } from "react";
import styled from "styled-components";
import changeCase from "change-case";

import { DepositProvider } from "@stellar/wallet-sdk";
import { Button, Select } from "@stellar/elements";

const El = styled.div``;

class AuthCurrency extends Component {
  state = {
    amount: "",
    args: {},
    res: null,
    error: null,
    fee: null,
  };

  async componentDidMount() {
    const depositProvider = new DepositProvider(
      "https://transfer-dot-jewel-api-dev.appspot.com",
    );
    this.setState({ depositProvider });

    try {
      const res = await depositProvider.fetchSupportedAssets();
      this.setState({ depositInfo: res });
    } catch (e) {
      this.setState({ error: `fetchSupportedAssets: ${e.toString()}` });
    }
  }

  _calculateFee = () => {
    const { account, assetCode, depositProvider } = this.props;
    const { amount } = this.state;
    depositProvider
      .fetchFinalFee({
        amount,
        assetCode,
        account,
      })
      .then((fee) => this.setState({ fee }))
      .catch((e) => this.setState({ error: e.toString() }));
  };

  _submit = () => {
    const { depositProvider, account } = this.props;

    const args = Object.keys(this.state.args).reduce(
      (memo, key) => ({
        ...memo,
        [changeCase.camelCase(key)]: this.state.args[key],
      }),
      {},
    );

    depositProvider
      .deposit({
        amount: this.state.amount,
        account,
        ...args,
      })
      .then((res) => this.setState({ res }))
      .catch((e) => {
        this.setState({ error: e.toString() });
      });
  };

  render() {
    const { assetCode, minAmount, maxAmount, fields } = this.props;
    const { args, amount, error, fee } = this.state;
    const amountFloat = parseFloat(amount);

    return (
      <El>
        <h3>{assetCode}</h3>

        {error && <p>Deposit error: {error}</p>}

        <label>
          Amount ({minAmount} to {maxAmount || "∞"}){" "}
          <input
            type="number"
            value={this.state.amount}
            onChange={(ev) =>
              this.setState({ amount: ev.target.value }) && this._calculateFee()
            }
          />
        </label>

        {fee && <p>Fee: {fee}</p>}

        {fields.map(({ name, description, choices }) => (
          <div key={name}>
            <h4>{name}</h4>
            <p>{description}</p>

            {choices && (
              <>
                <Select
                  onChange={(ev) =>
                    this.setState({
                      args: { ...args, [name]: ev.target.value },
                    })
                  }
                >
                  <option value="">-- Pick one --</option>
                  {choices.map((choice) => (
                    <option key={choice} value={choice}>
                      {choice}
                    </option>
                  ))}
                </Select>
              </>
            )}
          </div>
        ))}

        {amountFloat > minAmount && (!maxAmount || amountFloat < maxAmount) && (
          <Button onClick={this._submit}>Submit</Button>
        )}
      </El>
    );
  }
}

export default AuthCurrency;
