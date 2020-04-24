import React, { Component } from "react";
import moment from "moment";
import Json from "react-json-view";

class Payments extends Component {
  state = {
    payments: [],
    err: null,
    streamEnder: null,
  };

  componentDidMount() {
    if (this.props.dataProvider) {
      this._watchPayments(this.props.dataProvider);
    }
  }

  componentWillUpdate(nextProps) {
    if (
      typeof this.props.dataProvider !== typeof nextProps.dataProvider ||
      this.props.dataProvider.getAccountKey() !==
        nextProps.dataProvider.getAccountKey()
    ) {
      this._watchPayments(nextProps.dataProvider);
    }
  }

  componentWillUnmount() {
    if (this.state.streamEnder) {
      this.state.streamEnder();
    }
  }

  _watchPayments = async (dataProvider) => {
    // if there was a previous data  provider, kill the
    if (this.state.streamEnder) {
      this.state.streamEnder();
    }

    this.setState({
      dataProvider,
      payments: [],
      err: null,
      streamEnder: null,
    });

    const streamEnder = dataProvider.watchPayments({
      onMessage: (payment) => {
        this.setState({
          payments: [
            { payment, updateTime: new Date() },
            ...this.state.payments,
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
    const { payments, err } = this.state;
    return (
      <div>
        <h2>Payments</h2>
        <ul>
          {payments
            .sort((a, b) => b.payment.timestamp - a.payment.timestamp)
            .map(({ payment, updateTime }) => (
              <li key={payment.id}>
                Updated: {updateTime.toString()}
                <br />
                <ul>
                  <li>{moment.unix(payment.timestamp).format("LLL")}</li>
                  {payment.isInitialFunding && <li>First funding</li>}
                  <li>
                    {payment.isRecipient ? "Received" : "Sent"}{" "}
                    {payment.amount.toString()} {payment.token.code}
                  </li>
                  <li>
                    {payment.isRecipient ? "From" : "To"}{" "}
                    {payment.otherAccount.publicKey}
                  </li>
                  <li>Memo: {payment.memo}</li>
                  <li>Memo type: {payment.memoType}</li>
                </ul>
                {/* <Json src={payment} /> */}
              </li>
            ))}
        </ul>

        {err && <p>Error: {err.toString()}</p>}
      </div>
    );
  }
}

export default Payments;
