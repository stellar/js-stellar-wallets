# SEP-10 client authentication

## Overview

Provide an API that guides a developer along the process of getting an auth
token for authenticated deposits / withdraws.

High-level flow:

- Dev requests supported assets
- The response indicates some or all assets require authentication
- The dev instantiates a class with the authentication server URL
- It sends the user's public key to the authserver
- The authserver responds with a transaction XDR
- The dev signs the transaction with the user's stellar account
- POST the signed tx back to the authserver, and return the JWT

## References

https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0010.md

## Basic API

```ts
interface GetAuthTokenParams {
  authServer: string;
  password: string;
}

const jwt = await KeyManager.getAuthToken(params: GetAuthTokenParams);
```
