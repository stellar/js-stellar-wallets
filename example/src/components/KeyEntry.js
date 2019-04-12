import React, { Component } from "react";

import { KeyManager } from "./js-stellar-wallets";

export default class KeyEntry extends Component {
  state = {
    key: null,
    keyInput: "",
  };

  _setKey = () => {};

  render() {
    const { key, keyInput } = this.state;

    if (key) {
      return <pre>{JSON.stringify(key, null, 2)}</pre>;
    }

    return (
      <form
        onSubmit={(ev) => {
          ev.preventDefault();
          this._setKey(keyInput);
        }}
      >
        <label>
          Public key
          <input
            type="text"
            value={keyInput}
            onChange={(ev) => this.setState({ keyInput: ev.target.value })}
          />
          <button>Set key</button>
        </label>
      </form>
    );
  }
}

KeyEntry.propTypes = {};
