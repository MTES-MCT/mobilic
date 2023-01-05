import { broadCastChannel } from "../store/store";
import { parseActivityPayloadFromBackend } from "./activities";
import {
  DEFAULT_NB_DAYS_MISSIONS_HISTORY,
  DEFAULT_NB_FIRST_MISSIONS,
  parseMissionPayloadFromBackend
} from "./mission";
import { DAY, isoFormatLocalDate, now } from "./time";
import {
  COMPANY_SETTINGS_FRAGMENT,
  FULL_MISSION_FRAGMENT,
  REGULATION_COMPUTATIONS_FRAGMENT
} from "./apiFragments";
import { gql } from "graphql-tag";
import { captureSentryException } from "./sentry";
import values from "lodash/values";
import flatten from "lodash/flatten";
import { EMPLOYMENT_STATUS, getEmploymentsStatus } from "./employments";
import { CURRENT_MISSION_INFO } from "./apiQueries";

const USER_QUERY = gql`
  ${COMPANY_SETTINGS_FRAGMENT}
  ${FULL_MISSION_FRAGMENT}
  ${REGULATION_COMPUTATIONS_FRAGMENT}
  query user(
    $id: Int!
    $activityAfter: TimeStamp
    $nbFirstMissions: Int!
    $regulationsFromDate: Date
    $regulationsToDate: Date
  ) {
    user(id: $id) {
      id
      firstName
      lastName
      birthDate
      timezoneName
      email
      hasConfirmedEmail
      hasActivatedEmail
      disabledWarnings
      missions(fromTime: $activityAfter, first: $nbFirstMissions) {
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
          ...CompanySettings
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
      }
      regulationComputationsByDay(
        fromDate: $regulationsFromDate
        toDate: $regulationsToDate
      ) {
        ...RegulationComputations
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
        activityAfter: now() - DAY * DEFAULT_NB_DAYS_MISSIONS_HISTORY,
        nbFirstMissions: DEFAULT_NB_FIRST_MISSIONS,
        regulationsFromDate: isoFormatLocalDate(
          now() - DAY * DEFAULT_NB_DAYS_MISSIONS_HISTORY
        )
      },
      { context: { timeout: 12000 } }
    );
    await syncUser(userResponse.data.user, api, store);
    await broadCastChannel.postMessage("update");
  }, "load-user");
}

export async function syncUser(userPayload, api, store) {
  const {
    firstName,
    lastName,
    email,
    birthDate,
    timezoneName,
    hasConfirmedEmail,
    hasActivatedEmail,
    disabledWarnings,
    missions: missionsPayload,
    employments,
    currentEmployments,
    regulationComputationsByDay
  } = userPayload;

  const activities = [];
  const expenditures = [];
  const missionData = [];
  const comments = [];
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
  missions.forEach(mission => {
    activities.push(...mission.activities);
    expenditures.push(...mission.expenditures);
    comments.push(...mission.comments);
    missionData.push(parseMissionPayloadFromBackend(mission, store.userId()));
  });

  const syncActions = [];
  firstName &&
    lastName &&
    syncActions.push(
      store.setUserInfo(
        {
          firstName,
          lastName,
          email,
          timezoneName,
          birthDate,
          hasConfirmedEmail,
          hasActivatedEmail,
          disabledWarnings
        },
        false
      )
    );
  missions && syncActions.push(store.syncEntity(missionData, "missions"));
  activities &&
    syncActions.push(
      store.syncEntity(
        activities.map(parseActivityPayloadFromBackend),
        "activities"
      )
    );

  expenditures &&
    syncActions.push(store.syncEntity(expenditures, "expenditures"));
  comments && syncActions.push(store.syncEntity(comments, "comments"));
  const users = [];
  const vehicles = [];
  const knownAddresses = [];

  currentEmployments.forEach(e => {
    const company = e.company;
    company.users.forEach(u => {
      if (u.id !== userPayload.id) {
        const userMatch = users.find(u2 => u2.id === u.id);
        if (!userMatch) {
          users.push({ ...u, companyIds: [company.id] });
        } else userMatch.companyIds.push(company.id);
      }
    });
    vehicles.push(
      ...company.vehicles.map(v => ({ ...v, companyId: company.id }))
    );
    knownAddresses.push(
      ...company.knownAddresses.map(a => ({ ...a, companyId: company.id }))
    );
  });

  const sortedKnownAdresses = knownAddresses.sort((a1, a2) =>
    (a1.alias || a1.name).localeCompare(a2.alias || a2.name, undefined, {
      numeric: true,
      sensitivity: "base"
    })
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
  syncActions.push(store.syncEntity(users, "coworkers"));
  syncActions.push(store.syncEntity(vehicles, "vehicles"));
  syncActions.push(store.syncEntity(sortedKnownAdresses, "knownAddresses"));
  employments &&
    syncActions.push(
      store.syncEntity(flatten(values(employmentsPerCompanyId)), "employments")
    );
  syncActions.push(
    store.syncEntity(regulationComputationsByDay, "regulationComputationsByDay")
  );
  store.batchUpdate();
  await Promise.all(syncActions);
}
