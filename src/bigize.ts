import BigNumber from "bignumber.js";

import isArray from "lodash/isArray";
import isObject from "lodash/isObject";

interface KeyMap {
  [key: string]: any;
}

/**
 * Given a list of key names to bigize, traverse an object (usually, an
 * API response) for those keys, and convert their values to a BigNumber
 * (if it's a valid value).
 */
export function bigize(obj: any, keys: string[] = []): any {
  const keyMap: KeyMap = keys.reduce((memo, key) => ({ ...memo, [key]: true }), {});

  if (isArray(obj)) {
    return obj.map((o) => bigize(o, keys));
  }

  if (!isObject(obj)) {
    return obj;
  }

  if (obj instanceof BigNumber) {
    return obj;
  }

  return Object.keys(obj).reduce((memo: object, key: string): object => {
    if (keyMap[key] && typeof obj[key] !== "object") {
      return {
        ...memo,
        [key]:
          obj[key] === null || obj[key] === undefined
            ? obj[key]
            : new BigNumber(obj[key]).decimalPlaces(7, BigNumber.ROUND_HALF_UP),
      };
    }

    return {
      ...memo,
      [key]: bigize(obj[key], keys),
    };
  }, {});
}
