import React from "react";
import { makeStyles } from "@mui/styles";
import Drawer from "@mui/material/Drawer";
import { useSnackbarAlerts } from "../../../common/Snackbar";
import { useApi } from "common/utils/api";
import { LogHolidayForm } from "../../../common/LogHolidayForm";
import CloseButton from "../../../common/CloseButton";
import { graphQLErrorMatchesCode } from "common/utils/errors";
import { LOG_HOLIDAY_MUTATION } from "common/utils/apiQueries/missions";

const useStyles = makeStyles((theme) => ({
  missionTitle: {
    margin: 0,
    marginRight: theme.spacing(4),
    fontSize: "2em",
    fontWeight: "bold",
  },
  missionTitleContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing(3),
  },
}));

const LogHolidayDrawer = ({
  open,
  onClose,
  users,
  company,
  refreshCurrentWorkDays,
}) => {
  const classes = useStyles();
  const alerts = useSnackbarAlerts();
  const api = useApi();

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <div className={classes.missionTitleContainer}>
        <h1 className={classes.missionTitle}>Congé ou absence passé</h1>
        <CloseButton onClick={onClose} />
      </div>
      <LogHolidayForm
        users={users}
        handleSubmit={async (payload) =>
          await alerts.withApiErrorHandling(
            async () => {
              await api.graphQlMutate(LOG_HOLIDAY_MUTATION, {
                ...payload,
                companyId: company.id,
              });
              alerts.success(
                "Votre congé ou absence a bien été enregistré(e)",
                "",
                6000,
              );
              onClose();
              refreshCurrentWorkDays();
            },
            "create-holiday",
            (graphQLError) => {
              if (
                graphQLErrorMatchesCode(graphQLError, "OVERLAPPING_MISSIONS")
              ) {
                return "Des activités sont déjà enregistrées sur cette période.";
              }
            },
          )
        }
      />
    </Drawer>
  );
};

export default LogHolidayDrawer;
