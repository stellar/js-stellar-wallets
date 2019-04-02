interface Obj {
  [key: string]: any;
}

export function parseRecord(json: Obj): Obj {
  if (!json._links) {
    return json;
  }

  Object.keys(json._links).forEach((key: string) => {
    // If the key with the link name already exists, create a copy
    if (typeof json[key] !== "undefined") {
      json[`${key}_attr`] = json[key];
    }

    json[key] = () => null;
  });
  return json;
}

export function parseCollection(json: Obj): Obj {
  for (let i = 0; i < json._embedded.records.length; i += 1) {
    json._embedded.records[i] = parseRecord(json._embedded.records[i]);
  }
  return {
    records: json._embedded.records,
    next: () => null,
    prev: () => null,
  };
}

export function parseResponse(json: Obj): Obj {
  if (json._embedded && json._embedded.records) {
    return parseCollection(json);
  }

  return parseRecord(json);
}
