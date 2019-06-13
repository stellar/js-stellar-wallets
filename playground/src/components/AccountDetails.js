import React, { Component } from "react";

class AccountDetails extends Component {
  state = {
    accountDetails: null,
    err: null,
    updateTimes: [],
    streamEnder: null,
  };

  componentDidMount() {
    if (this.props.dataProvider) {
      this._fetchAccountDetails(this.props.dataProvider);
    }
  }

  componentWillUpdate(nextProps) {
    if (
      typeof this.props.dataProvider !== typeof nextProps.dataProvider ||
      this.props.dataProvider.getAccountKey() !==
        nextProps.dataProvider.getAccountKey()
    ) {
      this._fetchAccountDetails(nextProps.dataProvider);
    }
  }

  componentWillUnmount() {
    if (this.state.streamEnder) {
      this.state.streamEnder();
    }
  }

  _fetchAccountDetails = (dataProvider) => {
    // if there was a previous data  provider, kill the
    if (this.state.streamEnder) {
      this.state.streamEnder();
    }

    this.setState({
      accountDetails: null,
      err: null,
      updateTimes: [],
      streamEnder: null,
    });

    const streamEnder = dataProvider.watchAccountDetails({
      onMessage: (accountDetails) => {
        this.setState({
          accountDetails,
          updateTimes: [...this.state.updateTimes, new Date()],
        });
      },
      onError: (err) => {
        console.log("error: ", err);
        this.setState({ err });
        streamEnder();
      },
    });

    this.setState({
      streamEnder,
    });
  };

  render() {
    const { accountDetails, err, updateTimes } = this.state;
    return (
      <div>
        <h2>Account Details</h2>
        <ul>
          {updateTimes.map((time) => (
            <li key={time.toString()}>{time.toString()}</li>
          ))}
        </ul>

        {accountDetails && <pre>{JSON.stringify(accountDetails, null, 2)}</pre>}
        {err && <p>Error: {err.toString()}</p>}
      </div>
    );
  }
}

export default AccountDetails;
