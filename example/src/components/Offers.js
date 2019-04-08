import React, { Component } from "react";

class Offers extends Component {
  state = {
    offers: null,
    err: null,
    updateTimes: [],
    streamEnder: null,
  };

  componentDidMount() {
    if (this.props.dataProvider) {
      this._fetchOffers(this.props.dataProvider);
    }
  }

  componentWillUpdate(nextProps) {
    if (
      typeof this.props.dataProvider !== typeof nextProps.dataProvider ||
      this.props.dataProvider.getAccountKey() !==
        nextProps.dataProvider.getAccountKey()
    ) {
      this._fetchOffers(nextProps.dataProvider);
    }
  }

  componentWillUnmount() {
    if (this.state.streamEnder) {
      this.state.streamEnder();
    }
  }

  _fetchOffers = async (dataProvider) => {
    // if there was a previous data  provider, kill the
    if (this.state.streamEnder) {
      this.state.streamEnder();
    }

    this.setState({
      dataProvider,
      offers: null,
      err: null,
      updateTimes: [],
      streamEnder: null,
    });

    const offers = await dataProvider.fetchOpenOffers();

    this.setState({ offers });
  };

  render() {
    const { offers, err, updateTimes } = this.state;
    return (
      <div>
        <h2>Offers</h2>

        <ul>
          {updateTimes.map((time) => (
            <li key={time.toString()}>{time.toString()}</li>
          ))}
        </ul>

        {offers && <pre>{JSON.stringify(offers, null, 2)}</pre>}
        {err && <p>Error: {err.toString()}</p>}
      </div>
    );
  }
}

export default Offers;
