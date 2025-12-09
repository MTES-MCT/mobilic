import forEach from "lodash/forEach";
import { createOrSyncActivityReducer, deleteActivityReducer } from "./activity";
import {
  createExpenditureReducer,
  deleteExpenditureReducer
} from "./expenditure";
import {
  putAsideOriginalMissionsReducer,
  revertMissionToOriginalValuesReducer,
  validateMissionReducer
} from "./mission";
import { addWorkDaysReducer } from "./workDays";
import {
  updateCompaniesListReducer,
  updateCompanyDetailsReducer,
  updateCompanyIdReducer,
  updateCompanyNameAndPhoneNumberReducer,
  updateCompanyNbWorkerSnoozeReducer,
  updateEmploymentIdReducer,
  updateShouldSeeCertificateInfoReducer,
  updateShouldForceNbWorkerInfoReducer
} from "./sync";
import {
  createItemsReducer,
  deleteItemReducer,
  updateItemReducer
} from "./crud";
import { updateSettingsReducer } from "./settings";
import { updateActivitiesFiltersReducer } from "./activitiesFilters";
import {
  addVirtualActivityReducer,
  resetVirtualReducer
} from "./virtualActivities";
import { addVirtualExpenditureActionReducer } from "./virtualExpenditureActions";
import { addUsersReducer } from "./users";
import { updateValidationsFiltersReducer } from "./validationsFilters";
import { updateTeamsReducer } from "./team";
import { updateBusinessTypeReducer } from "./businessType";
import { updateEmploymentsLatestInvitateEmailTimeReducer } from "./employments";
import { updateCompanyDeletedMissionsReducer } from "./company";

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
  updateBusinessType: updateBusinessTypeReducer,
  delete: deleteItemReducer,
  updateCompanyDetails: updateCompanyDetailsReducer,
  updateCompaniesList: updateCompaniesListReducer,
  updateCompanyId: updateCompanyIdReducer,
  updateShouldSeeCertificateInfo: updateShouldSeeCertificateInfoReducer,
  updateShouldForceNbWorkerInfo: updateShouldForceNbWorkerInfoReducer,
  updateEmploymentId: updateEmploymentIdReducer,
  updateActivitiesFilters: updateActivitiesFiltersReducer,
  updateValidationsFilters: updateValidationsFiltersReducer,
  updateTeams: updateTeamsReducer,
  addVirtualActivity: addVirtualActivityReducer,
  addVirtualExpenditureAction: addVirtualExpenditureActionReducer,
  resetVirtual: resetVirtualReducer,
  addUsers: addUsersReducer,
  putAsideOriginalMissions: putAsideOriginalMissionsReducer,
  revertMissionToOriginalValues: revertMissionToOriginalValuesReducer,
  updateCompanyNameAndPhoneNumber: updateCompanyNameAndPhoneNumberReducer,
  updateCompanyNbWorkerSnooze: updateCompanyNbWorkerSnoozeReducer,
  updateEmploymentsLatestInvitateEmailTime: updateEmploymentsLatestInvitateEmailTimeReducer,
  updateCompanyDeletedMissions: updateCompanyDeletedMissionsReducer
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
