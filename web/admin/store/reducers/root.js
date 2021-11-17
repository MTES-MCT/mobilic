import forEach from "lodash/forEach";
import { createOrSyncActivityReducer, deleteActivityReducer } from "./activity";
import {
  createExpenditureReducer,
  deleteExpenditureReducer
} from "./expenditure";
import { validateMissionReducer } from "./mission";
import { addWorkDaysReducer } from "./workDays";
import { syncStoreReducer } from "./sync";
import {
  createItemsReducer,
  deleteItemReducer,
  updateItemReducer
} from "./crud";

export const ADMIN_ACTIONS = {
  createOrSyncActivity: createOrSyncActivityReducer,
  deleteActivity: deleteActivityReducer,
  createExpenditure: createExpenditureReducer,
  deleteExpenditure: deleteExpenditureReducer,
  validateMission: validateMissionReducer,
  addWorkDays: addWorkDaysReducer,
  syncStore: syncStoreReducer,
  create: createItemsReducer,
  update: updateItemReducer,
  delete: deleteItemReducer
};

const ADMIN_REDUCERS = {};

forEach(ADMIN_ACTIONS, (reducer, actionName) => {
  ADMIN_ACTIONS[actionName] = actionName;
  ADMIN_REDUCERS[actionName] = reducer;
});

export function adminRootReducer(state, { type, payload }) {
  const reducer = ADMIN_REDUCERS[type];
  if (reducer) return reducer(state, payload);
  return state;
}
