import forEach from "lodash/forEach";
import { createOrSyncActivityReducer, deleteActivityReducer } from "./activity";
import {
  createExpenditureReducer,
  deleteExpenditureReducer
} from "./expenditure";
import { validateMissionReducer } from "./mission";
import { addWorkDaysReducer } from "./workDays";
import {
  updateCompaniesListReducer,
  updateCompanyDetailsReducer,
  updateCompanyIdReducer
} from "./sync";
import {
  createItemsReducer,
  deleteItemReducer,
  updateItemReducer
} from "./crud";
import { updateSettingsReducer } from "./settings";
import { updateActivitiesFiltersReducer } from "./activitiesFilters";

export const ADMIN_ACTIONS = {
  createOrSyncActivity: createOrSyncActivityReducer,
  deleteActivity: deleteActivityReducer,
  createExpenditure: createExpenditureReducer,
  deleteExpenditure: deleteExpenditureReducer,
  validateMission: validateMissionReducer,
  addWorkDays: addWorkDaysReducer,
  create: createItemsReducer,
  update: updateItemReducer,
  updateSettings: updateSettingsReducer,
  delete: deleteItemReducer,
  updateCompanyDetails: updateCompanyDetailsReducer,
  updateCompaniesList: updateCompaniesListReducer,
  updateCompanyId: updateCompanyIdReducer,
  updateActivitiesFilters: updateActivitiesFiltersReducer
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
