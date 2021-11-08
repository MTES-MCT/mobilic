import zipObject from "lodash/zipObject";
import { LOCAL_STORAGE_SCHEMA } from "../schemas";
import { List } from "../types";
import { removePendingVersion } from "../offline";
import pickBy from "lodash/pickBy";
import mapValues from "lodash/mapValues";

export function removeOptimisticUpdateReducer(state, { requestId, entities }) {
  return {
    ...state,
    ...zipObject(
      entities,
      entities.map(entity => {
        if (LOCAL_STORAGE_SCHEMA[entity] === List) {
          return state[entity]
            .map(item => removePendingVersion(item, requestId))
            .filter(value => !!value);
        }
        return pickBy(
          mapValues(state[entity], item =>
            removePendingVersion(item, requestId)
          ),
          value => !!value
        );
      })
    )
  };
}
