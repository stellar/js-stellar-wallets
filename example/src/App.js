import React, { Component } from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

import { DataProvider } from "./js-stellar-wallets/";

import Balances from "./components/Balances";

class App extends Component {
  render() {
    return (
      <Router>
        <div>
          <nav>
            <ul>
              <li>
                <Link to="/">Balances</Link>
              </li>
            </ul>
          </nav>

          <Route exact path="/" component={Balances} />
        </div>
      </Router>
    );
  }
}

export default App;
