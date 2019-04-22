## Design goals

The overall goal of this library is **to make it easy to add wallet
functionality to an app**.

This library is meant to prioritize **ease of use**. That means:

- Design decisions should be anchored by specific and common use cases.
- Types, functions, attributes, etc. are named in an internally consistent way.
- Names should prioritize descriptiveness over brevity.
- Names are not always consistent with those in Horizon or the JS SDK.
- We prioritize doing things automatically for the user over the user having to
  repeat actions (for example: calculating prices given a "point of view").
- There should generally be only one obvious way of accomplishing a task. No
  name aliases or alternate APIs.
- We will not attempt to completely replace the JS SDK.

## Some consistent design decisions

- When requesting what could be a list of data, we'll almost always return a
  _map of ids to objects_, instead of as an array. You'll be in charge of
  sorting that information.
