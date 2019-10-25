import React, { Component } from "react";
import moment from "moment";
import Json from "react-json-view";

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

    const streamEnder = dataProvider.watchTransfers({
      onMessage: (transfer) => {
        this.setState({
          transfers: [
            { transfer, updateTime: new Date() },
            ...this.state.transfers,
          ],
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
    const { transfers, err } = this.state;
    return (
      <div>
        <h2>Transfers</h2>
        <ul>
          {transfers.map(({ transfer, updateTime }) => (
            <li key={updateTime.toString()}>
              Updated: {updateTime.toString()}
              <br />
              <ul>
                <li>{moment.unix(transfer).format("LLL")}</li>
                {transfer.isInitialFunding && <li>First funding</li>}
                <li>
                  {transfer.isRecipient ? "Received" : "Sent"} {transfer.amount}{" "}
                  of {transfer.token.code}
                </li>
                <li>
                  {transfer.isRecipient ? "From" : "To"}{" "}
                  {transfer.otherAccount.publicKey}
                </li>
              </ul>
              <Json src={transfer} />
            </li>
          ))}
        </ul>

        {err && <p>Error: {err.toString()}</p>}
      </div>
    );
  }
}

export default Transfers;
