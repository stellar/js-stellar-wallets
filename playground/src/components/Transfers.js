import React, { Component } from "react";

class Transfers extends Component {
  state = {
    transfers: [],
    err: null,
    streamEnder: null,
  };

  componentDidMount() {
    if (this.props.dataProvider) {
      this._watchTransfers(this.props.dataProvider);
    }
  }

  componentWillUpdate(nextProps) {
    if (
      typeof this.props.dataProvider !== typeof nextProps.dataProvider ||
      this.props.dataProvider.getAccountKey() !==
        nextProps.dataProvider.getAccountKey()
    ) {
      this._watchTransfers(nextProps.dataProvider);
    }
  }

  componentWillUnmount() {
    if (this.state.streamEnder) {
      this.state.streamEnder();
    }
  }

  _watchTransfers = async (dataProvider) => {
    // if there was a previous data  provider, kill the
    if (this.state.streamEnder) {
      this.state.streamEnder();
    }

    this.setState({
      dataProvider,
      transfers: [],
      err: null,
      streamEnder: null,
    });

    // const streamEnder = dataProvider.watchTransfers({
    //   onMessage: (transfer) => {
    //     this.setState({
    //       transfers: [
    //         { transfer, updateTime: new Date() },
    //         ...this.state.transfers,
    //       ],
    //     });
    //   },
    //   onError: (err) => {
    //     console.log("error: ", err);
    //     this.setState({ err });
    //     streamEnder();
    //   },
    // });

    // this.setState({
    //   streamEnder,
    // });
  };

  render() {
    const { transfers, err } = this.state;
    return (
      <div>
        <h2>Transfers</h2>

        <p>
          <em>not implemented yet</em>
        </p>

        <ul>
          {transfers.map(({ transfer, updateTime }) => (
            <li key={updateTime.toString()}>
              Updated: {updateTime.toString()}
              <br />
              <pre>{JSON.stringify(transfer, null, 2)}</pre>
            </li>
          ))}
        </ul>

        {err && <p>Error: {err.toString()}</p>}
      </div>
    );
  }
}

export default Transfers;
