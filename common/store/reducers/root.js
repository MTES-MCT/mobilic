import {
  createItemsReducer,
  deleteItemReducer,
  syncReducer,
  updateItemReducer
} from "./crud";
import forEach from "lodash/forEach";
import { removeTemporaryMissionIdReducer } from "./mission";
import { removeOptimisticUpdateReducer } from "./optimisticUpdate";
import { closeCurrentActivityReducer } from "./activity";

export const ACTIONS = {
  create: createItemsReducer,
  update: updateItemReducer,
  delete: deleteItemReducer,
  basicUpdate: (state, payload) => ({ ...state, ...payload }),
  removeOptimistic: removeOptimisticUpdateReducer,
  sync: syncReducer,
  closeCurrentActivity: closeCurrentActivityReducer,
  removeTemporaryMissionId: removeTemporaryMissionIdReducer
};

const REDUCERS = {};

forEach(ACTIONS, (reducer, actionName) => {
  ACTIONS[actionName] = actionName;
  REDUCERS[actionName] = reducer;
});

export function rootReducer(state, { type, payload }) {
  const reducer = REDUCERS[type];
  if (reducer) return reducer(state, payload);
  return state;
}
