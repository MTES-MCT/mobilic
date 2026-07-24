import React from "react";
import { ActivitySwitch } from "../components/ActivitySwitch";
import { resolveTeamAt } from "common/utils/coworkers";
import { CurrentActivityOverview } from "../components/CurrentActivityOverview";
import { MissionDetails } from "../components/MissionDetails";
import Box from "@mui/material/Box";
import {
  ACTIVITIES,
  ACTIVITIES_OPERATIONS,
  getCurrentActivityDuration
} from "common/utils/activities";
import { now } from "common/utils/time";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useModals } from "common/utils/modals";
import { missionLastLessThanAMinute } from "common/utils/mission";
import Notice from "../../common/Notice";
import { MobilicHeader } from "../../common/Header";

export function CurrentActivity({
  latestActivity,
  currentMission,
  pushNewTeamActivityEvent,
  updateMissionVehicle,
  registerKilometerReading,
  editActivityEvent,
  editVehicle,
  endMission,
  cancelMission,
  previousMissionEnd,
  openEndMissionModal
}) {
  const currentTeam = resolveTeamAt(currentMission.teamChanges, now());
  const modals = useModals();

  const setCurrentTime = React.useState(now())[1];
  // We force re-rendering every X sec to update timers
  React.useEffect(() => {
    setInterval(() => setCurrentTime(now()), 30000);
  }, []);

  const beginBreak = async () => {
    await editActivityEvent(
      latestActivity,
      ACTIVITIES_OPERATIONS.update,
      latestActivity.startTime,
      now(),
      null,
      !currentMission.submittedBySomeoneElse
    );
  };

  const beginBreakIfPossible = async () => {
    if (missionLastLessThanAMinute(currentMission)) {
      modals.open("confirmation", {
        textButtons: true,
        content: (
          <Notice
            type="warning"
            description="La première activité ayant duré moins d'une minute, passer en pause
            maintenant annulera votre mission en cours."
          />
        ),
        title: "Confirmer la pause",
        handleConfirm: beginBreak
      });
    } else {
      await beginBreak();
    }
  };

  return (
    <>
      <MobilicHeader forceMobile />
      <CurrentActivityOverview
        currentDayStart={currentMission.startTime}
        currentMission={currentMission}
        latestActivity={latestActivity}
      />
      <ActivitySwitch
        team={currentTeam}
        latestActivity={latestActivity}
        pushActivitySwitchEvent={async (
          activityType,
          driverId = null,
          vehicle = null,
          kilometerReading = null
        ) =>
          activityType === ACTIVITIES.break.name
            ? beginBreakIfPossible()
            : await Promise.all([
                vehicle
                  ? updateMissionVehicle({ mission: currentMission, vehicle })
                  : Promise.resolve(null),
                kilometerReading && currentMission.startLocation
                  ? registerKilometerReading({
                      mission: currentMission,
                      location: currentMission.startLocation,
                      isStart: true,
                      kilometerReading
                    })
                  : null,
                pushNewTeamActivityEvent({
                  activityType,
                  driverId,
                  missionId: currentMission.id,
                  team: currentMission.submittedBySomeoneElse
                    ? []
                    : currentTeam,
                  startTime: now()
                })
              ])
        }
        endMission={endTime => {
          openEndMissionModal({
            mission: currentMission,
            team: currentTeam,
            missionEndTime: endTime,
            latestActivityEndOrStartTime:
              latestActivity.endTime || latestActivity.startTime
          });
        }}
        requireVehicle={!currentMission.vehicle}
        company={currentMission.company}
      />
      <Box pt={3} />
      <MissionDetails
        mission={currentMission}
        editActivityEvent={editActivityEvent}
        hideExpenditures
        hideValidations
        hideHistory
        hideComments
        editVehicle={vehicle =>
          editVehicle({ mission: currentMission, vehicle })
        }
        previousMissionEnd={previousMissionEnd}
        createActivity={args =>
          pushNewTeamActivityEvent({ ...args, switchMode: false })
        }
        changeTeam={updatedCoworkers =>
          updatedCoworkers.forEach(cw => {
            if (cw.enroll) {
              pushNewTeamActivityEvent({
                activityType: latestActivity ? latestActivity.type : null,
                missionId: currentMission.id,
                startTime: now(),
                team: [cw.id],
                driverId: -1
              });
            } else {
              endMission({
                endTime: now(),
                mission: currentMission,
                userId: cw.id
              });
            }
          })
        }
        isMissionEnded={false}
        editKilometerReading={registerKilometerReading}
        titleProps={{ component: "h2" }}
      />
      <Box display="flex" justifyContent="center" pb="56px">
        <Button
          priority="secondary"
          onClick={() =>
            modals.open("abandonMission", {
              handleSubmit: async () => {
                modals.close("abandonMission");
                await cancelMission(currentMission);
              }
            })
          }
        >
          Abandonner la mission
        </Button>
      </Box>
    </>
  );
}
