export const MATOMO_CATEGORIES = {
  ADMIN_MISSION_ACTION: "admin-mission-action",
  ADMIN_NAVIGATION: "admin-navigation",
  ADMIN_ACTIVITY_FILTER: "admin-activity-filter",
  ADMIN_EXPORT: "admin-export",
  ADMIN_EMPLOYEE_INVITATION: "admin-employee-invitation",
  HOME: "homepage"
};

export const MATOMO_ACTIONS = {
  OPEN_MISSION_DRAWER: "open-mission-drawer",
  VALIDATE_MISSION: "validate-mission",
  INVITE_BATCH_MODAL_SUBMIT: "invite-batch-modal-submit",
  INVITE_NEW_EMPLOYEE: "invite-new-employee",
  INVITE_NEW_EMPLOYEE_SUBMIT: "invite-new-employee-submit",
  INVITE_MISSING_EMPLOYEES: "invite-missing-employees",
  INVITE_EMAIL_LIST: "invite-email-list",
  INACTIVE_EMPLOYEES_BANNER_VIEW: "inactive-employees-banner-view",
  INACTIVE_EMPLOYEES_BANNER_CLICK: "inactive-employees-banner-click",
  BATCH_TERMINATE_MODAL_OPEN: "batch-terminate-modal-open",
  BATCH_TERMINATE_MODAL_SUBMIT: "batch-terminate-modal-submit"
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

export const ADMIN_ADD_HOLIDAY = {
  category: MATOMO_CATEGORIES.ADMIN_MISSION_ACTION,
  action: "add-holiday",
  name: "Création d'une période de congés ou d'absence pour un salarié"
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

export const OPEN_PRESS_ARTICLE = (tagName) => {
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

export const ADMIN_CERTIFICATE_TAB_WITH_BADGE = {
  category: MATOMO_CATEGORIES.ADMIN_NAVIGATION,
  action: "open-certificate-tab-with-badge",
  name: "Affichage de l'onglet Certificat avec le badge"
};

export const ADMIN_CERTIFICATE_TAB_WITHOUT_BADGE = {
  category: MATOMO_CATEGORIES.ADMIN_NAVIGATION,
  action: "open-certificate-tab-without-badge",
  name: "Affichage de l'onglet Certificat sans le badge"
};

export const INVITE_EMAIL_LIST_CLICK = {
  category: MATOMO_CATEGORIES.ADMIN_EMPLOYEE_INVITATION,
  action: MATOMO_ACTIONS.INVITE_EMAIL_LIST,
  name: "Clic sur 'Inviter une liste d'emails'"
};

export const INVITE_MISSING_EMPLOYEES_CLICK = missingEmployeesCount => ({
  category: MATOMO_CATEGORIES.ADMIN_EMPLOYEE_INVITATION,
  action: MATOMO_ACTIONS.INVITE_MISSING_EMPLOYEES,
  name:
    "Clic sur 'Inviter les salariés manquants' (nb employés manquants détectés)",
  value: missingEmployeesCount
});

export const BATCH_INVITE_MODAL_SUBMIT = actualEmailsCount => ({
  category: MATOMO_CATEGORIES.ADMIN_EMPLOYEE_INVITATION,
  action: MATOMO_ACTIONS.INVITE_BATCH_MODAL_SUBMIT,
  name: "Soumission invitation par lot (nb d'invitations envoyées)",
  value: actualEmailsCount
});

export const INVITE_NEW_EMPLOYEE_CLICK = {
  category: MATOMO_CATEGORIES.ADMIN_EMPLOYEE_INVITATION,
  action: MATOMO_ACTIONS.INVITE_NEW_EMPLOYEE,
  name: "Clic sur 'Inviter un nouveau salarié'"
};

export const INVITE_NEW_EMPLOYEE_SUBMIT = {
  category: MATOMO_CATEGORIES.ADMIN_EMPLOYEE_INVITATION,
  action: MATOMO_ACTIONS.INVITE_NEW_EMPLOYEE_SUBMIT,
  name: "Soumission invitation nouveau salarié"
};

export const INACTIVE_EMPLOYEES_BANNER_VIEW = inactiveCount => ({
  category: MATOMO_CATEGORIES.ADMIN_EMPLOYEE_INVITATION,
  action: MATOMO_ACTIONS.INACTIVE_EMPLOYEES_BANNER_VIEW,
  name: "Affichage bandeau salariés inactifs",
  value: inactiveCount
});

export const INACTIVE_EMPLOYEES_BANNER_CLICK = {
  category: MATOMO_CATEGORIES.ADMIN_EMPLOYEE_INVITATION,
  action: MATOMO_ACTIONS.INACTIVE_EMPLOYEES_BANNER_CLICK,
  name: "Clic sur lien bandeau salariés inactifs"
};

export const BATCH_TERMINATE_MODAL_OPEN = {
  category: MATOMO_CATEGORIES.ADMIN_EMPLOYEE_INVITATION,
  action: MATOMO_ACTIONS.BATCH_TERMINATE_MODAL_OPEN,
  name: "Ouverture modale détachement en masse"
};

export const BATCH_TERMINATE_MODAL_SUBMIT = terminatedCount => ({
  category: MATOMO_CATEGORIES.ADMIN_EMPLOYEE_INVITATION,
  action: MATOMO_ACTIONS.BATCH_TERMINATE_MODAL_SUBMIT,
  name: "Soumission détachement en masse (nb détachements)",
  value: terminatedCount
});
