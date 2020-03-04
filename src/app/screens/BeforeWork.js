import React from "react";
import Container from "@material-ui/core/Container";
import { WorkDaySummary } from "../../common/components/WorkTimeSummary";
import PeopleIcon from "@material-ui/icons/People";
import PersonIcon from "@material-ui/icons/Person";
import Button from "@material-ui/core/Button";
import { PlaceHolder } from "../../common/components/PlaceHolder";
import Typography from "@material-ui/core/Typography";
import { ModalContext } from "../../common/utils/modals";
import { useStoreSyncedWithLocalStorage } from "../../common/utils/store";
import { ACTIVITIES } from "../../common/utils/activities";
import { UserNameHeader } from "../../common/components/UserNameHeader";
import Box from "@material-ui/core/Box";
import { WorkDayRevision } from "../components/ActivityRevision";
import EditIcon from "@material-ui/icons/Edit";
import Link from "@material-ui/core/Link";

export function BeforeWork({
  currentTime,
  previousDaysEventsByDay,
  pushNewActivityEvent,
  cancelOrReviseActivityEvent
}) {
  const [openRevisionModal, setOpenRevisionModal] = React.useState(false);

  const latestDayEvents =
    previousDaysEventsByDay[previousDaysEventsByDay.length - 1];

  const latestDayEnd = latestDayEvents
    ? latestDayEvents[latestDayEvents.length - 1]
    : null;
  const shouldResumeDay =
    latestDayEnd &&
    new Date(latestDayEnd.eventTime).toISOString().slice(0, 10) ===
      new Date(currentTime).toISOString().slice(0, 10);

  const modals = React.useContext(ModalContext);
  const storeSyncedWithLocalStorage = useStoreSyncedWithLocalStorage();

  return (
    <>
      <Container className="app-container" maxWidth={false}>
        <UserNameHeader />
        <Container
          disableGutters
          className="stretch-container scrollable"
          maxWidth={false}
          style={{ paddingTop: "2vh", justifyContent: "flex-start" }}
        >
          {latestDayEvents ? (
            <>
              <WorkDaySummary dayEvents={latestDayEvents} />
              <Box my={1}>
                <Box
                  className="flexbox-flex-start"
                  onClick={() => setOpenRevisionModal(true)}
                >
                  <EditIcon color="primary" />
                  <Link component="button" variant="h6">
                    Corriger activités
                  </Link>
                </Box>
              </Box>
            </>
          ) : (
            <PlaceHolder>
              <Typography variant="h4">👋</Typography>
              <Typography style={{ fontWeight: "bold" }}>
                Bienvenue sur MobiLIC !
              </Typography>
            </PlaceHolder>
          )}
        </Container>
        <Box className="cta-container">
          <Button
            variant="contained"
            color="primary"
            startIcon={<PersonIcon />}
            onClick={() => {
              modals.open("missionSelection", {
                handleContinue: dayInfos =>
                  modals.open("firstActivity", {
                    handleItemClick: activityType => {
                      if (shouldResumeDay) {
                        const breakInsteadOfRest = {
                          ...latestDayEnd,
                          type: ACTIVITIES.break.name
                        };
                        storeSyncedWithLocalStorage.removeEvent(
                          latestDayEnd,
                          "activities"
                        );
                        storeSyncedWithLocalStorage.pushEvent(
                          breakInsteadOfRest,
                          "activities"
                        );
                      }
                      pushNewActivityEvent({
                        activityType,
                        team: [storeSyncedWithLocalStorage.userInfo()],
                        mission: dayInfos.mission,
                        vehicleRegistrationNumber:
                          dayInfos.vehicleRegistrationNumber
                      });
                      modals.close("missionSelection");
                    }
                  })
              });
            }}
          >
            {shouldResumeDay ? "Reprendre la journée" : "Commencer la journée"}
          </Button>
          <div style={{ height: "2vh" }} />
          <Button
            variant="outlined"
            color="primary"
            startIcon={<PeopleIcon />}
            onClick={() =>
              modals.open("teamSelection", {
                handleContinue: () =>
                  modals.open("missionSelection", {
                    handleContinue: dayInfos => {
                      modals.open("firstActivity", {
                        handleItemClick: activityType => {
                          const teamMates = storeSyncedWithLocalStorage
                            .coworkers()
                            .filter(cw => cw.isInCurrentTeam);
                          const team = [
                            storeSyncedWithLocalStorage.userInfo(),
                            ...teamMates
                          ];
                          if (shouldResumeDay) {
                            const breakInsteadOfRest = {
                              ...latestDayEnd,
                              type: ACTIVITIES.break.name
                            };
                            storeSyncedWithLocalStorage.removeEvent(
                              latestDayEnd,
                              "activities"
                            );
                            storeSyncedWithLocalStorage.pushEvent(
                              breakInsteadOfRest,
                              "activities"
                            );
                          }
                          const createActivity = (driverIdx = null) => {
                            pushNewActivityEvent({
                              activityType,
                              team,
                              driverIdx,
                              mission: dayInfos.mission,
                              vehicleRegistrationNumber:
                                dayInfos.vehicleRegistrationNumber
                            });
                            modals.close("missionSelection");
                            modals.close("teamSelection");
                          };
                          if (
                            team.length > 1 &&
                            activityType === ACTIVITIES.drive.name
                          ) {
                            modals.open("driverSelection", {
                              team,
                              handleDriverSelection: createActivity
                            });
                          } else createActivity();
                        }
                      });
                    }
                  })
              })
            }
          >
            {shouldResumeDay ? "Reprendre en équipe" : "Commencer en équipe"}
          </Button>
        </Box>
      </Container>
      <WorkDayRevision
        open={latestDayEvents && openRevisionModal}
        handleClose={() => setOpenRevisionModal(false)}
        activityEvents={latestDayEvents}
        handleActivityRevision={cancelOrReviseActivityEvent}
      />
    </>
  );
}
