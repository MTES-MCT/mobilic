import React from "react";
import { makeStyles } from "@mui/styles";
import { useAdminStore } from "../../store/store";
import { TeamFilter } from "../../components/TeamFilter";
import { EmployeeProgressBar } from "../../components/EmployeeProgressBar";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { InviteButtons } from "../../components/InviteButtons";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
  },
  topSection: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 0,
    gap: theme.spacing(2),
  },
  sectionTitle: {
    margin: 0,
    fontWeight: "bold"
  },
  topLeft: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
  },
  progressBar: {
    border: "1px solid blue",
  } ,
  bottomSection: {
    display: "flex",
    flexDirection: "row",
    gap: theme.spacing(3),
  }
}));

const CurrentEmployeesCountSection = ({ teams, setTeams, employeesData, handleBatchInvite, handleSingleInvite, hasMadeInvitations }) => {
  const classes = useStyles();
  const adminStore = useAdminStore();
  const companyHasTeams = adminStore?.teams?.length > 0;

  return (
    <div className={classes.root}>
      <div className={classes.topSection}>
        <div className={classes.topLeft}>
          <h2 className={`${classes.sectionTitle} fr-text--lg`}>Salariés</h2>
          <Badge>
            {employeesData.registeredEmployees}
          </Badge>
        </div>
        <div>
          <InviteButtons
            onBatchInvite={handleBatchInvite}
            onSingleInvite={handleSingleInvite}
            shouldShowBadge={
              !hasMadeInvitations &&
              !employeesData?.shouldShowSingleInviteButton &&
              employeesData?.shouldShowBadge
            }
            employeeProgressData={employeesData}
          />
        </div>
      </div>
      <div className={classes.bottomSection}>
        {
          companyHasTeams && teams && (
          <TeamFilter
              teams={teams}
              setTeams={setTeams}
              orderByProperty="rankName"
          />
        )}
        <EmployeeProgressBar progressData={employeesData} />
      </div>
    </div>
  )
}

export default CurrentEmployeesCountSection;