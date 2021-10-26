import { LOCAL_STORAGE_SCHEMA } from "./schemas";
import { Map } from "./types";
import pickBy from "lodash/pickBy";
import mapValues from "lodash/mapValues";
import { resolveLatestVersion } from "./offline";

export function entitySelector(entity) {
  return state => {
    if (LOCAL_STORAGE_SCHEMA[entity] !== Map) return state[entity];

    return pickBy(
      mapValues(state[entity], item => resolveLatestVersion(item)),
      value => !!value
    );
  };
}
