import { Map, String, List } from "./types";

// What is stored in local storage and how to read/write to it
export const LOCAL_STORAGE_SCHEMA = {
  userId: {
    deserialize: value => (value ? parseInt(value) : value),
    serialize: String.serialize
  },
  controllerId: {
    deserialize: value => (value ? parseInt(value) : value),
    serialize: String.serialize
  },
  userInfo: Map,
  controllerInfo: Map,
  coworkers: Map,
  knownAddresses: List,
  activities: Map,
  employments: List,
  comments: Map,
  missions: Map,
  expenditures: Map,
  vehicles: Map
};

export const NON_PERSISTENT_SCHEMA = {
  nextRequestId: {
    deserialize: value => (value ? parseInt(value) : 1),
    serialize: String.serialize
  },
  nextEntityObjectId: {
    deserialize: value => (value ? parseInt(value) : 1),
    serialize: String.serialize
  },
  identityMap: Map,
  nextRequestGroupId: {
    deserialize: value => (value ? parseInt(value) : 1),
    serialize: String.serialize
  },
  pendingRequests: List
};
