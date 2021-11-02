import { LOCAL_STORAGE_SCHEMA } from "./schemas";
import { Map } from "./types";
import pickBy from "lodash/pickBy";
import mapValues from "lodash/mapValues";
import { resolveLatestVersion } from "./offline";
import { orderEmployments } from "../utils/employments";

export function entitySelector(entity) {
  return state => {
    if (LOCAL_STORAGE_SCHEMA[entity] !== Map) return state[entity];

    return pickBy(
      mapValues(state[entity], item => resolveLatestVersion(item)),
      value => !!value
    );
  };
}

export function employmentSelector(state) {
  return orderEmployments(entitySelector("employments")(state));
}
