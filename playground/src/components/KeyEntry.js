import React, { Component } from "react";
import StellarSdk from "stellar-sdk";
import { Input } from "@stellar/elements";

import { KeyManager, KeyManagerPlugins, KeyType } from "@stellar/wallet-sdk";

export default class KeyEntry extends Component {
  state = {
    key: null,
    keyInput: localStorage.getItem("key") || "",
    keyManager: null,
    error: null,
    password: "",
    authServer: "",
    authToken: null,
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
      localStorage.setItem("key", privateKey);
      const account = StellarSdk.Keypair.fromSecret(privateKey);

      const key = {
        publicKey: account.publicKey(),
        privateKey: account.secret(),
        type: KeyType.plaintext,
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

  _getAuthToken = (authServer) => {
    const { keyManager, password, key } = this.state;
    this.setState({ authToken: null });

    keyManager
      .getAuthToken({
        publicKey: key.publicKey,
        password,
        authServer,
      })
      .then((authToken) => this.setState({ authToken }));
  };

  render() {
    const { key, keyInput, password, error } = this.state;

    if (key) {
      return (
        <>
          <pre>{JSON.stringify(key, null, 2)}</pre>

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
