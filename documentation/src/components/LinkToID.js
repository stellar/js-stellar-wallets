import React from "react";

import { getLink } from "helpers/getLink";

export const LinkToID = ({ children, id, ...rest }) => (
  <a
    href={getLink(id)
      .split("#")
      .reduce((memo, item) => item)}
    {...rest}
  >
    {children}
  </a>
);
