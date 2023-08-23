import { unixTimestampToDate } from "./time";

export const SURVEYS = { EMPLOYEE_SOCIAL_IMPACT_1: { surveyId: "cHirYHre" } };

export const SURVEY_ACTIONS = {
  DISPLAY: "DISPLAY",
  CLOSE: "CLOSE",
  SUBMIT: "SUBMIT"
};

export function hasNeverSeenSurvey(surveyActions, surveyId) {
  return !surveyActions?.find(sa => sa.surveyId === surveyId);
}

export function hasNotSubmittedSurvey(surveyActions, surveyId) {
  return !surveyActions?.find(
    sa => sa.surveyId === surveyId && sa.action === SURVEY_ACTIONS.SUBMIT
  );
}

export function firstActionDateForSurvey(surveyActions, surveyId) {
  const filteredSurveyActions = surveyActions.filter(
    sa => sa.surveyId === surveyId
  );
  if (filteredSurveyActions) {
    return new Date(
      Math.min(
        ...filteredSurveyActions.map(sa => unixTimestampToDate(sa.creationTime))
      )
    );
  } else {
    return null;
  }
}

export function nbTimesSurveyWasDisplayed(surveyActions, surveyId) {
  return (
    surveyActions?.filter(
      sa => sa.surveyId === surveyId && sa.action === SURVEY_ACTIONS.DISPLAY
    )?.length || 0
  );
}
