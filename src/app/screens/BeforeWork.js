import React from "react";
import Container from "@material-ui/core/Container";
import { WorkDaySummary } from "../../common/components/WorkTimeSummary";
import PeopleIcon from "@material-ui/icons/People";
import PersonIcon from "@material-ui/icons/Person";
import IconButton from "@material-ui/core/IconButton";
import Button from "@material-ui/core/Button";
import { PlaceHolder } from "../../common/components/PlaceHolder";
import { shareEvents } from "../../common/utils/events";
import Typography from "@material-ui/core/Typography";
import { ModalContext } from "../utils/modals";
import { useStoreSyncedWithLocalStorage } from "../../common/utils/store";
import { useApi } from "../../common/utils/api";
import Divider from "@material-ui/core/Divider";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";

export function BeforeWork({ previousDaysEventsByDay, pushNewActivityEvent }) {
  const latestDayEvents =
    previousDaysEventsByDay[previousDaysEventsByDay.length - 1];

  const modals = React.useContext(ModalContext);
  const storeSyncedWithLocalStorage = useStoreSyncedWithLocalStorage();
  const api = useApi();

  return (
    <Container className="container">
      <div className="user-name-header">
        <Typography noWrap variant="h6">
          {storeSyncedWithLocalStorage.getFullName()}
        </Typography>
        <IconButton
          color="primary"
          onClick={() =>
            modals.open("confirmation", {
              handleConfirm: () => api.logout(),
              title: "Confirmer déconnexion"
            })
          }
        >
          <ExitToAppIcon />
        </IconButton>
      </div>
      <Divider className="full-width-divider" />
      <Container
        disableGutters
        className="scrollable"
        style={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
      >
        {latestDayEvents ? (
          <WorkDaySummary
            dayEvents={latestDayEvents}
            handleExport={() => shareEvents([latestDayEvents])}
          />
        ) : (
          <PlaceHolder>
            <Typography variant="h4">👋</Typography>
            <Typography style={{ fontWeight: "bold" }}>
              Bienvenue sur MobiLIC !
            </Typography>
          </PlaceHolder>
        )}
        <div style={{ height: "5vh", flexGrow: 1 }} />
      </Container>
      <div className="start-buttons-container unshrinkable">
        <Button
          variant="contained"
          color="primary"
          startIcon={<PersonIcon />}
          onClick={() => {
            modals.open("firstActivity", {
              handleItemClick: activityType =>
                pushNewActivityEvent(activityType)
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
                modals.open("firstActivity", {
                  handleItemClick: activityName => {
                    pushNewActivityEvent(
                      activityName,
                      storeSyncedWithLocalStorage
                        .coworkers()
                        .filter(cw => cw.isInCurrentTeam)
                    );
                    modals.close("teamSelection");
                  }
                })
            })
          }
        >
          Commencer en équipe
        </Button>
      </div>
    </Container>
  );
}
