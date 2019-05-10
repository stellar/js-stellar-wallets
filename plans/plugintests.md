# Plugin testing arm

Developers who write their own Encrypter or KeyStore plugins will want to know
that they meet spec. Likewise, we want an easy way to make sure these plugins
handle edge cases properly (in addition to, you know, working). So it makes
sense for the library to export an arm that helps people write unit tests for
their plugins.

# General description

`Encrypter` and `KeyStore` plugins are the highest priority to test.
(`KeyTypeHandler` plugins are important too, but we don't expect people to write
these handlers, and they might be difficult to generically test.)

My idea is for each plugin type to have a function that runs a gamut of tests on
the plugins, and resolves a promise if the plugin is valid, or rejects with an
error object if the plugin is not.

Another option is to output one test function for each plugin function, but that
seems tedious to implement.

Pros:

- It would let people work and test function-by-function instead of having to
  write the whole plugin first.

Cons:

- It's hard to individually test some functions (like, how do we write a generic
  test for encryptKey without also having access to decryptKey?)

The con might make it impossible to implement the alternative, so one function
per plugin it is.

# API Shape

```javascript
export const PluginTesting = {
  testEncrypter(encrypter: Encrypter): Promise<void> {},

  testKeyStore(keyStore: KeyStore): Promise<void> {},
};
```
