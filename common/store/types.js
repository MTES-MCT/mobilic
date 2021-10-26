// What is stored in local storage and how to read/write to it
export const String = {
  serialize: value => value || "",
  deserialize: value => value || null
};
export const List = {
  serialize: JSON.stringify,
  deserialize: value => (value ? JSON.parse(value) : [])
};
export const Map = {
  serialize: JSON.stringify,
  deserialize: value => (value ? JSON.parse(value) : {})
};
