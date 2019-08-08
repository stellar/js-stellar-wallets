import React, { Component } from "react";
import styled from "styled-components";

import { DepositProvider } from "@stellar/wallet-sdk";
import { Button, ButtonThemes, Select } from "@stellar/elements";

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
    const { account, asset_code, depositProvider } = this.props;
    const { amount } = this.state;
    depositProvider
      .fetchFinalFee({
        amount,
        asset_code,
        account,
      })
      .then((fee) => this.setState({ fee }))
      .catch((e) => this.setState({ error: e.toString() }));
  };

  _submit = () => {
    const {
      depositProvider,
      account,
      asset_code,
      authentication_required,
    } = this.props;

    depositProvider
      .deposit({
        amount: this.state.amount,
        account,
        asset_code,
        authentication_required,
        ...this.state.args,
      })
      .then((res) => this.setState({ res }))
      .catch((e) => {
        this.setState({ error: e.toString() });
      });
  };

  render() {
    const { asset_code, min_amount, max_amount, fields } = this.props;
    const { args, amount, error, fee } = this.state;
    const amountFloat = parseFloat(amount);

    return (
      <El>
        <h3>{asset_code}</h3>

        {error && <p>Deposit error: {error}</p>}

        <label>
          Amount ({min_amount} to {max_amount || "∞"}){" "}
          <input
            type="number"
            value={this.state.amount}
            onChange={(ev) => {
              this.setState({ amount: ev.target.value });
              this._calculateFee();
            }}
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

        {amountFloat > min_amount && (!max_amount || amountFloat < max_amount) && (
          <Button theme={ButtonThemes.primary} onClick={this._submit}>
            Submit
          </Button>
        )}
      </El>
    );
  }
}

export default AuthCurrency;
