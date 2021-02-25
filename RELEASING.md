# Releasing @stellar/wallet-sdk to NPM

1. Bump up `version` on `package.json`
2. Update CHANGELOG.md
3. Make a commit with the changes above.
4. Open a pull request with the changes.

Once the pull request is merged, you need to:

1. Run `npm publish --access public`.
2. Run `git push`.
3. Run `git push --tags`.
