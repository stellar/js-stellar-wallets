import React, { Component } from "react";
import PropTypes from "prop-types";
import StellarSdk from "stellar-sdk";
import { Input, Checkbox } from "@stellar/elements";

import { KeyManager, KeyManagerPlugins, KeyType } from "@stellar/wallet-sdk";

export default class KeyEntry extends Component {
  state = {
    keyMetadata: null,
    keyInput: "",
    keyManager: null,
    error: null,
    password: "test",
    authServer: "",
    authToken: null,
    authTokenError: null,
    isTestnet: false,
  };

  componentDidMount() {
    const keyStore = new KeyManagerPlugins.MemoryKeyStore();

    const keyManager = new KeyManager({
      keyStore,
    });

    keyManager.registerEncrypter(KeyManagerPlugins.ScryptEncrypter);

    window.ExampleKeyManager = keyManager;

    this.setState({ keyManager });

    // try to fill the auth server from memory
    const localAuthServer = localStorage.getItem("authServer");
    if (localAuthServer) {
      this.setState({ authServer: localAuthServer });
    }
  }

  _setKey = async (privateKey, password) => {
    let key;

    try {
      const account = StellarSdk.Keypair.fromSecret(privateKey);
      key = {
        publicKey: account.publicKey(),
        privateKey: account.secret(),
        type: KeyType.plaintextKey,
      };
      localStorage.setItem("key", key.privateKey);
    } catch (e) {
      this.setState({ error: "That wasn't a valid secret key." });
      return;
    }

    try {
      this.state.keyManager.setDefaultNetworkPassphrase(
        this.state.isTestnet
          ? StellarSdk.Networks.TESTNET
          : StellarSdk.Networks.PUBLIC,
      );
      const keyMetadata = await this.state.keyManager.storeKey({
        key,
        password,
        encrypterName: KeyManagerPlugins.ScryptEncrypter.name,
      });

      this.setState({ keyMetadata: keyMetadata });

      this.props.onSetKey(key.publicKey, this.state.isTestnet);
    } catch (e) {
      this.setState({ error: e.toString() });
    }
  };

  _fetchAuthToken = async (authServer) => {
    const { keyManager, password, keyMetadata } = this.state;
    this.setState({ authToken: null });
    localStorage.setItem("authServer", authServer);

    try {
      const authToken = await keyManager.fetchAuthToken({
        id: keyMetadata.id,
        password,
        authServer,
      });

      this.setState({ authToken });
      this.props.onGetAuthToken(authToken);
    } catch (e) {
      this.setState({ authTokenError: e.toString() });
    }
  };

  render() {
    const {
      authServer,
      authToken,
      authTokenError,
      keyMetadata,
      keyInput,
      password,
      error,
      isTestnet,
    } = this.state;

    const localKey = localStorage.getItem("key");

    if (keyMetadata) {
      return (
        <>
          {isTestnet ? <p>Testnet</p> : <p>Mainnet</p>}
          <p>Password: {password}</p>

          <pre>{JSON.stringify(keyMetadata, null, 2)}</pre>

          <form
            onSubmit={(ev) => {
              ev.preventDefault();
              this._fetchAuthToken(authServer);
            }}
          >
            <label>
              Auth server
              <Input
                type="text"
                value={authServer}
                onChange={(ev) =>
                  this.setState({ authServer: ev.target.value })
                }
              />
            </label>

            <button>Get auth token</button>

            {authToken && <p>Auth token: {authToken}</p>}
            {authTokenError && <p>Error: {authTokenError}</p>}
          </form>

          <button onClick={() => this.setState({ key: null })}>
            Start over
          </button>
        </>
      );
    }

    return (
      <form
        onSubmit={(ev) => {
          ev.preventDefault();
          this._setKey(keyInput, password);
        }}
      >
        <label>
          Secret seed
          <Input
            type="text"
            value={keyInput}
            onChange={(ev) => this.setState({ keyInput: ev.target.value })}
          />
        </label>

        {localKey && localKey !== keyInput && (
          <button onClick={() => this.setState({ keyInput: localKey })}>
            Load from local storage
          </button>
        )}

        <label>
          Password
          <Input
            type="text"
            value={password}
            onChange={(ev) => this.setState({ password: ev.target.value })}
          />
        </label>

        <Checkbox
          label="Use testnet"
          checked={isTestnet}
          onChange={() => this.setState({ isTestnet: !isTestnet })}
        />

        {error && <p style={{ color: "red" }}>Sad error: {error}</p>}

        <button>Set key</button>
      </form>
    );
  }
}

KeyEntry.propTypes = {
  onSetKey: PropTypes.func.isRequired,
  onGetAuthToken: PropTypes.func.isRequired,
};
