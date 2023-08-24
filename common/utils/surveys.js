import { isDateBeforeNbDays, unixTimestampToDate } from "./time";

export const SURVEY_ACTIONS = {
  DISPLAY: "DISPLAY",
  CLOSE: "CLOSE",
  SUBMIT: "SUBMIT"
};

const NB_DAYS_BEFORE_FIRST_DISPLAY = 61;
const NB_DAYS_BEFORE_REDISPLAY = 30;
const NB_MAX_DISPLAY = 3;

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

export function shouldDisplayEmployeeSocialImpactSurveyOnMainPage(
  userInfo,
  companies
) {
  const surveyId = process.env.REACT_APP_SURVEY_EMPLOYEE_SOCIAL_IMPACT;
  if (!surveyId) {
    return false;
  } else if (companies?.some(c => c.admin)) {
    return false;
  } else if (
    !isDateBeforeNbDays(
      unixTimestampToDate(userInfo.creationTime),
      NB_DAYS_BEFORE_FIRST_DISPLAY
    )
  ) {
    return false;
  } else if (hasNeverSeenSurvey(userInfo.surveyActions, surveyId)) {
    return true;
  } else {
    const firstActionForSurvey = firstActionDateForSurvey(
      userInfo.surveyActions,
      surveyId
    );
    if (
      hasNotSubmittedSurvey(userInfo.surveyActions, surveyId) &&
      firstActionForSurvey &&
      isDateBeforeNbDays(firstActionForSurvey, NB_DAYS_BEFORE_REDISPLAY) &&
      nbTimesSurveyWasDisplayed(userInfo.surveyActions, surveyId) <
        NB_MAX_DISPLAY
    ) {
      return true;
    }
  }
  return false;
}
