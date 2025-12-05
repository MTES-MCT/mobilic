import { gql } from "graphql-tag";

export const CREATE_SURVEY_ACTION = gql`
  mutation createSurveyAction(
    $userId: Int!
    $surveyId: String!
    $action: SurveyActionEnum!
  ) {
    createSurveyAction(userId: $userId, surveyId: $surveyId, action: $action) {
      surveyId
      creationTime
      action
    }
  }
`;

export const DISABLE_WARNING_MUTATION = gql`
  mutation disableValidationWarning($warningName: WarningToDisableTypeEnum!) {
    account {
      disableWarning(warningName: $warningName) {
        success
      }
    }
  }
`;

export const SIREN_QUERY = gql`
  query sirenInfo($siren: String!) {
    sirenInfo(siren: $siren) {
      registrationStatus
      legalUnit
      facilities
    }
  }
`;

export const SNOOZE_NB_WORKER_INFO = gql`
  mutation snoozeNbWorkerInfo($employmentId: Int!) {
    snoozeNbWorkerInfo(employmentId: $employmentId) {
      success
    }
  }
`;

export const ADD_SCENARIO_TESTING_RESULT = gql`
  mutation addScenarioTestingResult(
    $userId: Int!
    $scenario: ScenarioEnum!
    $action: ActionEnum!
  ) {
    addScenarioTestingResult(
      userId: $userId
      scenario: $scenario
      action: $action
    ) {
      success
    }
  }
`;

export const USER_QUERY_ENOUGH_BREAK = gql`
  query hasEnoughBreak($id: Int!) {
    user(id: $id) {
      id
      hadEnoughBreakLastMission
    }
  }
`;
