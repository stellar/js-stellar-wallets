import React from "react";

const ToC = ({ itemsByKind }) => {
  return (
    <div>
      {Object.keys(itemsByKind).map((kind) => (
        <>
          <h3>{kind}</h3>

          {itemsByKind[kind] &&
            itemsByKind[kind].map((item) => (
              <li>
                <a href={`#item_${item.id}`}>{item.name}</a> ({item.id})
              </li>
            ))}
        </>
      ))}
    </div>
  );
};

export default ToC;
