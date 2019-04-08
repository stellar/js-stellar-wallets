import React, { Component } from "react";

class Balances extends Component {
  state = {
    balances: null,
    err: null,
    updateTimes: [],
    streamEnder: null,
  };

  componentDidMount() {
    if (this.props.dataProvider) {
      this._fetchBalances(this.props.dataProvider);
    }
  }

  componentWillUpdate(nextProps) {
    if (
      typeof this.props.dataProvider !== typeof nextProps.dataProvider ||
      this.props.dataProvider.getAccountKey() !==
        nextProps.dataProvider.getAccountKey()
    ) {
      this._fetchBalances(nextProps.dataProvider);
    }
  }

  componentWillUnmount() {
    if (this.state.streamEnder) {
      this.state.streamEnder();
    }
  }

  _fetchBalances = (dataProvider) => {
    // if there was a previous data  provider, kill the
    if (this.state.streamEnder) {
      this.state.streamEnder();
    }

    this.setState({
      balances: null,
      err: null,
      updateTimes: [],
      streamEnder: null,
    });

    const streamEnder = dataProvider.watchBalances({
      onMessage: (balances) => {
        this.setState({
          balances,
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
    const { balances, err, updateTimes } = this.state;
    return (
      <div>
        <h2>Balances</h2>
        <ul>
          {updateTimes.map((time) => (
            <li key={time.toString()}>{time.toString()}</li>
          ))}
        </ul>

        {balances && <pre>{JSON.stringify(balances, null, 2)}</pre>}
        {err && <p>Error: {err.toString()}</p>}
      </div>
    );
  }
}

export default Balances;
