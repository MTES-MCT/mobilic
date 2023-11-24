import { createSelector } from "reselect";
import map from "lodash/map";
import flatMap from "lodash/flatMap";
import { missionWithStats } from "./missionSelectors";

// faire sur le même modèle que mission selector

// export const missionDeletedEntriesSelector = createSelector(
//     missionWithStats,
//     missions => {
//         return flatMap(missions?.map(m => missionDeletedToEntries(m))).filter(
//             entryDeletedByAdmin
//         );
//     }
// );

// const missionDeletedToEntries = mission =>
//     map(mission.userStats, us => ({
//         ...us,
//         missionTooOld: mission.missionTooOld,
//         missionNotUpdatedForTooLong: mission.missionNotUpdatedForTooLong,
//         name: mission.name,
//         missionStartTime: mission.startTime,
//         missionId: mission.id,
//         companyId: mission.companyId,
//         id: `${mission.id}${us.user.id}`,
//         multipleDays:
//             getStartOfDay(mission.startTime) !==
//             getStartOfDay(mission.endTime ? mission.endTime - 1 : now())
//     }));
