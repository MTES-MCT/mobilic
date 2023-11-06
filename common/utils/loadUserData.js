import { broadCastChannel } from "../store/store";
import { parseActivityPayloadFromBackend } from "./activities";
import {
  DEFAULT_MONTH_RANGE_HISTORY,
  parseMissionPayloadFromBackend
} from "./mission";
import { startOfMonth, subMonths } from "date-fns";
import {
  COMPANY_SETTINGS_FRAGMENT,
  FULL_MISSION_FRAGMENT
} from "./apiFragments";
import { gql } from "graphql-tag";
import { captureSentryException } from "./sentry";
import values from "lodash/values";
import flatten from "lodash/flatten";
import { EMPLOYMENT_STATUS, getEmploymentsStatus } from "./employments";
import { CURRENT_MISSION_INFO } from "./apiQueries";
import { onLogIn } from "./updatePassword";
import { jsToUnixTimestamp } from "common/utils/time";

const CURRENT_EMPLOYMENTS_QUERY = gql`
  query currentEmployments($id: Int!) {
    user(id: $id) {
      id
      currentEmployments {
        id
        startDate
        isAcknowledged
        hasAdminRights
        company {
          id
          name
          siren
          sirets
          users {
            id
            firstName
            lastName
          }
          knownAddresses {
            id
            alias
            name
            postalCode
            city
          }
          vehicles {
            id
            name
            registrationNumber
            lastKilometerReading
          }
        }
        team {
          id
          name
          vehicles {
            id
            name
            registrationNumber
            lastKilometerReading
          }
          knownAddresses {
            id
            alias
            name
            postalCode
            city
          }
        }
      }
    }
  }
`;

const USER_QUERY = gql`
  ${COMPANY_SETTINGS_FRAGMENT}
  ${FULL_MISSION_FRAGMENT}
  query user($id: Int!, $activityAfter: TimeStamp) {
    user(id: $id) {
      id
      creationTime
      surveyActions {
        surveyId
        creationTime
        action
      }
      firstName
      lastName
      birthDate
      timezoneName
      shouldUpdatePassword
      email
      hasConfirmedEmail
      hasActivatedEmail
      disabledWarnings
      missions(fromTime: $activityAfter) {
        edges {
          node {
            ...FullMissionData
          }
        }
      }
      employments(includePending: true) {
        id
        startDate
        endDate
        isAcknowledged
        hasAdminRights
        hideEmail
        authorizedClients {
          id
          name
        }
        company {
          id
          name
          siren
          sirets
          ...CompanySettings
        }
      }
    }
  }
`;

export async function loadUserData(api, store, alerts) {
  const userId = store.userId();
  if (!userId) return;
  await alerts.withApiErrorHandling(async () => {
    const userResponse = await api.graphQlQuery(
      USER_QUERY,
      {
        id: userId,
        activityAfter: jsToUnixTimestamp(
          startOfMonth(
            subMonths(new Date(), DEFAULT_MONTH_RANGE_HISTORY)
          ).getTime()
        )
      },
      { context: { timeout: 12000 } }
    );
    await syncUser(userResponse.data.user, api, store);
    loadCoworkerData(api, store, alerts).then(r => {});
    await broadCastChannel.postMessage("update");
  }, "load-user");
}

async function loadCoworkerData(api, store, alerts) {
  const userId = store.userId();
  if (!userId) return;
  await alerts.withApiErrorHandling(async () => {
    const userResponse = await api.graphQlQuery(
      CURRENT_EMPLOYMENTS_QUERY,
      {
        id: userId
      },
      { context: { timeout: 12000 } }
    );
    await syncCoworkerData(userResponse.data.user, store);
    await broadCastChannel.postMessage("update");
  }, "load-user");
}

async function syncCoworkerData(coworkerPayload, store) {
  const { currentEmployments } = coworkerPayload;

  const users = [];
  const vehicles = [];
  const knownAddresses = [];

  const sortedKnownAdresses = knownAddresses.sort((a1, a2) =>
    (a1.alias || a1.name).localeCompare(a2.alias || a2.name, undefined, {
      numeric: true,
      sensitivity: "base"
    })
  );
  const syncActions = [];
  currentEmployments.forEach(e => {
    const company = e.company;
    const team = e.team;
    company.users.forEach(u => {
      if (u.id !== coworkerPayload.id) {
        const userMatch = users.find(u2 => u2.id === u.id);
        if (!userMatch) {
          users.push({ ...u, companyIds: [company.id] });
        } else userMatch.companyIds.push(company.id);
      }
    });
    if (team && team.vehicles.length > 0) {
      vehicles.push(
        ...team.vehicles.map(v => ({ ...v, companyId: company.id }))
      );
    } else {
      vehicles.push(
        ...company.vehicles.map(v => ({ ...v, companyId: company.id }))
      );
    }
    if (team && team.knownAddresses.length > 0) {
      knownAddresses.push(
        ...team.knownAddresses.map(a => ({ ...a, companyId: company.id }))
      );
    } else {
      knownAddresses.push(
        ...company.knownAddresses.map(a => ({ ...a, companyId: company.id }))
      );
    }
  });
  syncActions.push(store.syncEntity(users, "coworkers"));
  syncActions.push(store.syncEntity(vehicles, "vehicles"));
  syncActions.push(store.syncEntity(sortedKnownAdresses, "knownAddresses"));
  store.batchUpdate();
  await Promise.all(syncActions);
}

export async function syncMissions(missions, store, syncMethod) {
  const syncActions = [];
  const activities = [];
  const expenditures = [];
  const missionData = [];
  const comments = [];

  missions.forEach(mission => {
    activities.push(...mission.activities);
    expenditures.push(...mission.expenditures);
    comments.push(...mission.comments);
    missionData.push(parseMissionPayloadFromBackend(mission, store.userId()));
  });

  missions && syncActions.push(syncMethod(missionData, "missions"));
  activities &&
    syncActions.push(
      syncMethod(activities.map(parseActivityPayloadFromBackend), "activities")
    );

  expenditures && syncActions.push(syncMethod(expenditures, "expenditures"));
  comments && syncActions.push(syncMethod(comments, "comments"));

  store.batchUpdate();
  await Promise.all(syncActions);
}

export async function syncUser(userPayload, api, store) {
  const {
    firstName,
    lastName,
    email,
    creationTime,
    birthDate,
    timezoneName,
    shouldUpdatePassword,
    hasConfirmedEmail,
    hasActivatedEmail,
    disabledWarnings,
    missions: missionsPayload,
    employments,
    surveyActions
  } = userPayload;

  onLogIn(shouldUpdatePassword);

  const missions = missionsPayload.edges.map(e => e.node);

  // Get end status for latest mission;
  if (missions.length > 0) {
    const latestMission = missions[0];
    try {
      const latestMissionInfo = await api.graphQlQuery(CURRENT_MISSION_INFO, {
        id: latestMission.id
      });
      latestMission.ended = latestMissionInfo.data.mission.isEndedForSelf;
      latestMission.submitter = latestMissionInfo.data.mission.submitter;
    } catch (err) {
      captureSentryException(err);
    }
  }

  const syncActions = [];
  firstName &&
    lastName &&
    syncActions.push(
      store.setUserInfo(
        {
          firstName,
          lastName,
          email,
          creationTime,
          timezoneName,
          birthDate,
          hasConfirmedEmail,
          hasActivatedEmail,
          disabledWarnings,
          surveyActions
        },
        false
      )
    );

  const employmentsPerCompanyId = {};
  employments.forEach(e => {
    const company = e.company;
    if (!employmentsPerCompanyId[company.id]) {
      employmentsPerCompanyId[company.id] = [e];
    } else {
      const exisitingEmployment = employmentsPerCompanyId[company.id][0];
      const existingEmploymentStatus = getEmploymentsStatus(
        exisitingEmployment
      );
      const status = getEmploymentsStatus(e);
      if (
        existingEmploymentStatus === EMPLOYMENT_STATUS.pending &&
        status === EMPLOYMENT_STATUS.active
      )
        employmentsPerCompanyId[company.id].push(e);
    }
  });
  employments &&
    syncActions.push(
      store.syncEntity(flatten(values(employmentsPerCompanyId)), "employments")
    );
  store.batchUpdate();
  await Promise.all(syncActions);

  await syncMissions(missions, store, store.syncEntity);
}
