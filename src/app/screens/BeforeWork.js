import React from "react";
import Container from "@material-ui/core/Container";
import { WorkDaySummary } from "../../common/components/WorkTimeSummary";
import PeopleIcon from "@material-ui/icons/People";
import PersonIcon from "@material-ui/icons/Person";
import Button from "@material-ui/core/Button";
import { PlaceHolder } from "../../common/components/PlaceHolder";
import { shareEvents } from "../../common/utils/events";
import Typography from "@material-ui/core/Typography";
import { ModalContext } from "../utils/modals";

export function BeforeWork({
  pushNewCurrentDayEvent,
  previousDaysEventsByDay,
  coworkers,
  setCoworkers,
  clearTeam
}) {
  const latestDayEvents =
    previousDaysEventsByDay[previousDaysEventsByDay.length - 1];

  const modals = React.useContext(ModalContext);

  return (
    <Container className="container">
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
            clearTeam();
            modals.open("firstActivity", {
              handleItemClick: activityName =>
                pushNewCurrentDayEvent(activityName)
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
                    pushNewCurrentDayEvent(activityName);
                    modals.close("teamSelection");
                  }
                }),
              coworkers: coworkers,
              setCoworkers: setCoworkers
            })
          }
        >
          Commencer en équipe
        </Button>
      </div>
    </Container>
  );
}
