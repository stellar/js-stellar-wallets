import React from "react";

const LinkToID = ({ children, id, ...rest }) => (
  <a href={`#item_${id}`} {...rest}>
    {children}
  </a>
);

export default LinkToID;
