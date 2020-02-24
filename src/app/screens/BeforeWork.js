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
import Divider from "@material-ui/core/Divider";
import { ACTIVITIES } from "../../common/utils/activities";
import { UserNameHeader } from "../../common/components/UserNameHeader";
import Box from "@material-ui/core/Box";
import Dialog from "@material-ui/core/Dialog";

export function BeforeWork({ previousDaysEventsByDay, pushNewActivityEvent }) {
  const latestDayEvents =
    previousDaysEventsByDay[previousDaysEventsByDay.length - 1];

  const modals = React.useContext(ModalContext);
  const storeSyncedWithLocalStorage = useStoreSyncedWithLocalStorage();

  return (
    <Container className="app-container" maxWidth={false}>
      <UserNameHeader />
      <Container
        disableGutters
        className="stretch-container scrollable"
        maxWidth={false}
        style={{ paddingTop: "2vh" }}
      >
        {latestDayEvents ? (
          <WorkDaySummary dayEvents={latestDayEvents} />
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
          Commencer la journée
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
          Commencer en équipe
        </Button>
      </Box>
    </Container>
  );
}
