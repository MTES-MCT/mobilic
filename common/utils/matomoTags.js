export const MATOMO_CATEGORIES = {
  ADMIN_MISSION_ACTION: "admin-mission-action",
  ADMIN_NAVIGATION: "admin-navigation",
  ADMIN_ACTIVITY_FILTER: "admin-activity-filter",
  ADMIN_EXPORT: "admin-export",
  HOME: "homepage"
};

export const MATOMO_ACTIONS = {
  OPEN_MISSION_DRAWER: "open-mission-drawer",
  VALIDATE_MISSION: "validate-mission"
};

export const EDIT_ACTIVITY_IN_MISSION_PANEL = {
  category: MATOMO_CATEGORIES.ADMIN_MISSION_ACTION,
  action: "edit-activity",
  name: "Edition activité dans volet Mission"
};

export const ADD_ACTIVITY_IN_MISSION_PANEL = {
  category: MATOMO_CATEGORIES.ADMIN_MISSION_ACTION,
  action: "add-activity",
  name: "Ajout activité dans volet Mission"
};

export const ADD_EMPLOYEE_IN_MISSION_PANEL = {
  category: MATOMO_CATEGORIES.ADMIN_MISSION_ACTION,
  action: "add-employee",
  name: "Ajout employé dans volet Mission"
};

export const VALIDATE_MISSION_IN_MISSION_PANEL = {
  category: MATOMO_CATEGORIES.ADMIN_MISSION_ACTION,
  action: MATOMO_ACTIONS.VALIDATE_MISSION,
  name: "Validation dans volet mission"
};

export const VALIDATE_MISSION_IN_VALIDATION_PANEL = {
  category: MATOMO_CATEGORIES.ADMIN_MISSION_ACTION,
  action: MATOMO_ACTIONS.VALIDATE_MISSION,
  name: "Validation dans tableau Validation"
};

export const ADMIN_ADD_MISSION = {
  category: MATOMO_CATEGORIES.ADMIN_MISSION_ACTION,
  action: "add-new-mission",
  name: "Création d'une nouvelle mission"
};

export const OPEN_MISSION_DRAWER_IN_ACTIVITY_PANEL = {
  category: MATOMO_CATEGORIES.ADMIN_NAVIGATION,
  action: MATOMO_ACTIONS.OPEN_MISSION_DRAWER,
  name: "Drawer Mission dans tableau Activités"
};

export const OPEN_MISSION_DRAWER_WITH_ACTIVITY_TOO_LONG = {
  category: MATOMO_CATEGORIES.ADMIN_NAVIGATION,
  action: MATOMO_ACTIONS.OPEN_MISSION_DRAWER,
  name: "Drawer Mission via activité trop longue"
};

export const OPEN_MISSION_DRAWER_IN_WORKDAY_PANEL = {
  category: MATOMO_CATEGORIES.ADMIN_NAVIGATION,
  action: MATOMO_ACTIONS.OPEN_MISSION_DRAWER,
  name: "Drawer Mission via panel WorkDay"
};

export const OPEN_MISSION_DRAWER_IN_VALIDATION_PANEL = {
  category: MATOMO_CATEGORIES.ADMIN_NAVIGATION,
  action: MATOMO_ACTIONS.OPEN_MISSION_DRAWER,
  name: "Drawer Mission via tableau Validation"
};

export const OPEN_WORKDAY_DRAWER = {
  category: MATOMO_CATEGORIES.ADMIN_NAVIGATION,
  action: "open-workday-drawer",
  name: "Drawer WorkDay"
};

export const ACTIVITY_FILTER_PERIOD = newPeriod => {
  return {
    category: MATOMO_CATEGORIES.ADMIN_ACTIVITY_FILTER,
    action: "filter-activities-period",
    name: `Activités par "${newPeriod}"`
  };
};

export const ACTIVITY_FILTER_MIN_DATE = {
  category: MATOMO_CATEGORIES.ADMIN_ACTIVITY_FILTER,
  action: "filter-activities-min-date",
  name: "Changement date de début vue Activités"
};

export const ACTIVITY_FILTER_MAX_DATE = {
  category: MATOMO_CATEGORIES.ADMIN_ACTIVITY_FILTER,
  action: "filter-activities-max-date",
  name: "Changement date de fin vue Activités"
};

export const ACTIVITY_FILTER_EMPLOYEE = {
  category: MATOMO_CATEGORIES.ADMIN_ACTIVITY_FILTER,
  action: "filter-activities-employee",
  name: "Changement filtre employé dans vue Activités"
};

export const ADMIN_EXPORT_EXCEL = {
  category: MATOMO_CATEGORIES.ADMIN_EXPORT,
  action: "export-excel",
  name: "Export Excel"
};

export const ADMIN_EXPORT_C1B = {
  category: MATOMO_CATEGORIES.ADMIN_EXPORT,
  action: "export-c1b",
  name: "Export C1B"
};

export const CHANGE_VALIDATION_TAB = tagName => {
  return {
    category: MATOMO_CATEGORIES.ADMIN_NAVIGATION,
    action: "change-validation-tab",
    name: tagName
  };
};

export const CANCEL_UPDATE_MISSION = {
  category: MATOMO_CATEGORIES.ADMIN_MISSION_ACTION,
  action: "cancel-update-mission",
  name: "Annulation de modification de mission"
};

export const OPEN_CANCEL_UPDATE_MISSION = {
  category: MATOMO_CATEGORIES.ADMIN_NAVIGATION,
  action: "open-cancel-mission",
  name: "Affichage pop up annulation modification mission"
};

export const OPEN_PRESS_ARTICLE = tagName => {
  return {
    category: MATOMO_CATEGORIES.HOME,
    action: "open-article",
    name: tagName
  };
};

export const PLAY_VIDEO = tagName => {
  return {
    category: MATOMO_CATEGORIES.HOME,
    action: "play-video",
    name: tagName
  };
};
