import {
  addPendingCreate,
  addPendingDelete,
  addPendingEdit,
  hasPendingUpdates
} from "../offline";
import { LOCAL_STORAGE_SCHEMA } from "../schemas";
import { List } from "../types";
import reduce from "lodash/reduce";
import merge from "lodash/merge";
import omit from "lodash/omit";
import mapValues from "lodash/mapValues";
import pickBy from "lodash/pickBy";
import keyBy from "lodash/keyBy";

export function createItemsReducer(state, { items, entity, pendingRequestId }) {
  let itemList = [...items];
  if (pendingRequestId) {
    itemList = itemList.map(item => addPendingCreate(item, pendingRequestId));
  }

  if (LOCAL_STORAGE_SCHEMA[entity] === List) {
    return {
      ...state,
      [entity]: [...state[entity], ...itemList]
    };
  }

  return {
    ...state,
    [entity]: {
      ...state[entity],
      ...reduce(
        itemList,
        (acc, item) => {
          const key = item.id.toString();
          const previousItem = state[entity][key];
          if (!previousItem || !hasPendingUpdates(previousItem))
            acc[key] = item;
          else
            acc[key] = {
              ...item,
              pendingUpdates: [
                ...(previousItem.pendingUpdates || []),
                ...(item.pendingUpdates || [])
              ]
            };
          return acc;
        },
        {}
      )
    }
  };
}

export function updateItemReducer(
  state,
  {
    id,
    entity,
    update,
    pendingRequestId,
    createOrReplace = false,
    deepMerge = false
  }
) {
  function getUpdatedItem(value) {
    let item = createOrReplace ? {} : { ...value };
    if (hasPendingUpdates(value) || pendingRequestId) {
      item.pendingUpdates = value.pendingUpdates || [];
      if (pendingRequestId)
        item = addPendingEdit(item, pendingRequestId, update);
    }
    if (!pendingRequestId) {
      if (deepMerge) merge(item, update);
      else item = { ...item, ...update };
    }
    return item;
  }

  const key = id.toString();
  const newEntity =
    LOCAL_STORAGE_SCHEMA[entity] === List
      ? state[entity].filter(item => item.id !== id)
      : omit(state[entity], key);

  const previousItem =
    LOCAL_STORAGE_SCHEMA[entity] === List
      ? state[entity].find(item => item.id === id)
      : state[entity][key];

  if (previousItem || createOrReplace) {
    const newItem = getUpdatedItem(previousItem || {});
    if (LOCAL_STORAGE_SCHEMA[entity] === List) {
      newEntity.push(newItem);
    } else newEntity[newItem.id ? newItem.id.toString() : key] = newItem;
  }

  return {
    ...state,
    [entity]: newEntity
  };
}

export function deleteItemReducer(state, { id, entity, pendingRequestId }) {
  return {
    ...state,
    [entity]: !pendingRequestId
      ? LOCAL_STORAGE_SCHEMA[entity] === List
        ? state[entity].filter(item => item.id !== id)
        : omit(state[entity], id.toString())
      : LOCAL_STORAGE_SCHEMA[entity] === List
      ? state[entity].map(item =>
          item.id === id ? addPendingDelete(item, pendingRequestId) : item
        )
      : mapValues(state[entity], (item, id_) =>
          id_ === id.toString()
            ? addPendingDelete(item, pendingRequestId)
            : item
        )
  };
}

export function syncReducer(
  state,
  { items, entity, belongsToSyncScope = () => true }
) {
  const prevEntityState = state[entity];
  if (LOCAL_STORAGE_SCHEMA[entity] === List) {
    return {
      ...state,
      [entity]: [
        ...prevEntityState.filter(
          item =>
            !belongsToSyncScope(item) ||
            (hasPendingUpdates(item) &&
              item.pendingUpdates.some(upd => upd.type === "create"))
        ),
        ...items
      ]
    };
  }
  items.forEach(item => {
    const prevEntityMatch = prevEntityState[item.id.toString()];
    if (prevEntityMatch && hasPendingUpdates(prevEntityMatch)) {
      item.pendingUpdates = prevEntityMatch.pendingUpdates.filter(
        upd => upd.type !== "create"
      );
    }
  });
  return {
    ...state,
    [entity]: {
      ...pickBy(
        prevEntityState,
        item =>
          !belongsToSyncScope(item) ||
          (hasPendingUpdates(item) &&
            item.pendingUpdates.some(upd => upd.type === "create"))
      ),
      ...keyBy(items, item => item.id.toString())
    }
  };
}
