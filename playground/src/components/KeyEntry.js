import React, { Component } from "react";
import StellarSdk from "stellar-sdk";
import { Input } from "@stellar/elements";

import { KeyManager, KeyManagerPlugins, KeyType } from "@stellar/wallet-sdk";

export default class KeyEntry extends Component {
  state = {
    key: null,
    keyInput: "",
    keyManager: null,
    error: null,
    password: "test",
    authServer: "",
    authToken: null,
    authTokenError: null,
  };

  componentDidMount() {
    const keyStore = new KeyManagerPlugins.MemoryKeyStore();

    const keyManager = new KeyManager({
      keyStore,
    });

    keyManager.registerEncrypter(KeyManagerPlugins.ScryptEncrypter);

    window.ExampleKeyManager = keyManager;

    this.setState({ keyManager });
  }

  _setKey = async (privateKey, password) => {
    try {
      const account = StellarSdk.Keypair.fromSecret(privateKey);

      const key = {
        publicKey: account.publicKey(),
        privateKey: account.secret(),
        type: KeyType.plaintextKey,
      };

      const keyMetadata = await this.state.keyManager.storeKey({
        key,
        password,
        encrypterName: KeyManagerPlugins.ScryptEncrypter.name,
      });

      this.setState({ key: keyMetadata });

      this.props.onSetKey(keyMetadata.publicKey);
    } catch (e) {
      this.setState({ error: e.toString() });
    }
  };

  _getAuthToken = async (authServer) => {
    const { keyManager, password, key } = this.state;
    this.setState({ authToken: null });

    try {
      const authToken = await keyManager.getAuthToken({
        publicKey: key.publicKey,
        password,
        authServer,
      });

      this.setState({ authToken });
    } catch (e) {
      this.setState({ authTokenError: e.toString() });
    }
  };

  render() {
    const {
      authServer,
      authToken,
      authTokenError,
      key,
      keyInput,
      password,
      error,
    } = this.state;

    const localKey = localStorage.getItem("key");

    if (key) {
      return (
        <>
          <p>Password: {password}</p>

          <pre>{JSON.stringify(key, null, 2)}</pre>

          <form
            onSubmit={(ev) => {
              ev.preventDefault();
              this._getAuthToken(authServer);
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
            {authTokenError && <p>Auth token: {authTokenError}</p>}
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

        {error && <p style={{ color: "red" }}>Sad error: {error}</p>}

        <button>Set key</button>
      </form>
    );
  }
}

KeyEntry.propTypes = {};
