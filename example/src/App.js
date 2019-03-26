import React, { Component } from "react";

import { DataProvider } from "./js-stellar-wallets/";

class App extends Component {
  render() {
    return (
      <pre>{JSON.stringify(Object.keys(DataProvider.prototype), null, 2)}</pre>
    );
  }
}

export default App;
