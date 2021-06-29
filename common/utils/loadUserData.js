import * as Sentry from "@sentry/browser";
import { broadCastChannel } from "./store";
import { parseActivityPayloadFromBackend } from "./activities";
import { parseMissionPayloadFromBackend } from "./mission";
import { DAY, now } from "./time";
import {
  COMPANY_SETTINGS_FRAGMENT,
  CURRENT_MISSION_INFO,
  FULL_MISSION_FRAGMENT
} from "./apiQueries";
import { gql } from "@apollo/client/core";

const USER_QUERY = gql`
  ${COMPANY_SETTINGS_FRAGMENT}
  ${FULL_MISSION_FRAGMENT}
  query user($id: Int!, $activityAfter: TimeStamp) {
    user(id: $id) {
      id
      firstName
      lastName
      birthDate
      email
      hasConfirmedEmail
      hasActivatedEmail
      missions(fromTime: $activityAfter, first: 200) {
        edges {
          node {
            ...FullMissionData
          }
        }
      }
      currentEmployments {
        id
        startDate
        isAcknowledged
        isPrimary
        hasAdminRights
        company {
          id
          name
          siren
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
          }
        }
      }
    }
  }
`;

export async function loadUserData(api, store) {
  const userId = store.userId();
  if (!userId) return;
  try {
    const userResponse = await api.graphQlQuery(
      USER_QUERY,
      {
        id: userId,
        activityAfter: now() - DAY * 215
      },
      { context: { timeout: 12000 } }
    );
    await syncUser(userResponse.data.user, api, store);
    await broadCastChannel.postMessage("update");
  } catch (err) {
    Sentry.captureException(err);
    console.log(err);
  }
}

export async function syncUser(userPayload, api, store) {
  const {
    firstName,
    lastName,
    email,
    birthDate,
    hasConfirmedEmail,
    hasActivatedEmail,
    missions: missionsPayload,
    currentEmployments
  } = userPayload;

  const activities = [];
  const expenditures = [];
  const missionData = [];
  const comments = [];
  const missions = missionsPayload.edges.map(e => e.node);

  // Get end status for latest mission;
  if (missions.length > 0) {
    const latestMission = missions[missions.length - 1];
    try {
      const latestMissionInfo = await api.graphQlQuery(CURRENT_MISSION_INFO, {
        id: latestMission.id
      });
      latestMission.ended = latestMissionInfo.data.mission.isEndedForSelf;
      latestMission.submitter = latestMissionInfo.data.mission.submitter;
    } catch (err) {
      Sentry.captureException(err);
      console.log(err);
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
          birthDate,
          hasConfirmedEmail,
          hasActivatedEmail
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
  syncActions.push(store.syncEntity(users, "coworkers"));
  syncActions.push(store.syncEntity(vehicles, "vehicles"));
  syncActions.push(store.syncEntity(knownAddresses, "knownAddresses"));
  currentEmployments &&
    syncActions.push(store.syncEntity(currentEmployments, "employments"));
  store.batchUpdateStore();
  await Promise.all(syncActions);
}
