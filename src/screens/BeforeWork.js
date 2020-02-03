import React from "react";
import Container from "@material-ui/core/Container";
import { WorkDaySummary } from "../components/WorkTimeSummary";
import PeopleIcon from "@material-ui/icons/People";
import PersonIcon from "@material-ui/icons/Person";
import Button from "@material-ui/core/Button";
import { PlaceHolder } from "../components/PlaceHolder";
import { shareEvents } from "../utils/events";
import Typography from "@material-ui/core/Typography";

export function BeforeWork({
  previousDaysEventsByDay,
  setOpenTeamSelectionModal,
  setOpenFirstActivityModal,
  clearTeam
}) {
  const latestDayEvents =
    previousDaysEventsByDay[previousDaysEventsByDay.length - 1];

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
            setOpenFirstActivityModal(true);
          }}
        >
          Commencer la journée
        </Button>
        <div style={{ height: "2vh" }} />
        <Button
          variant="outlined"
          color="primary"
          startIcon={<PeopleIcon />}
          onClick={() => setOpenTeamSelectionModal(true)}
        >
          Commencer en équipe
        </Button>
      </div>
    </Container>
  );
}
