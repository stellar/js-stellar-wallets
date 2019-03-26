import React, { Component } from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

import Balances from "./components/Balances";
import Offers from "./components/Offers";

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
              <li>
                <Link to="/offers">Offers</Link>
              </li>
            </ul>
          </nav>

          <Route exact path="/" component={Balances} />
          <Route exact path="/offers" component={Offers} />
        </div>
      </Router>
    );
  }
}

export default App;
