import React from "react";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import { makeStyles } from "@mui/styles";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import List from "@mui/material/List";
import { AlertGroup } from "./AlertGroup";
import { SubmitCancelButtons } from "../../common/SubmitCancelButtons";
import { prettyFormatDayHour } from "common/utils/time";

const useStyles = makeStyles(theme => ({
  container: {
    paddingBottom: theme.spacing(4)
  },
  linkContainer: {
    textAlign: "center",
    marginTop: theme.spacing(2)
  },
  italicInfo: {
    fontStyle: "italic",
    color: theme.palette.grey[600]
  },
  subtitle: {
    color: theme.palette.grey[600]
  },
  helpText: {
    fontWeight: "bold"
  },
  divider: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4)
  }
}));

export function UserReadAlerts({
  setTab,
  groupedAlerts,
  setPeriodOnFocus,
  isReportingInfractions,
  saveInfractions,
  cancelInfractions,
  setReportedInfractions,
  reportedInfractionsLastUpdateTime,
  readOnlyAlerts
}) {
  const classes = useStyles();

  return (
    <Container maxWidth="md" className={classes.container}>
      {isReportingInfractions && (
        <Typography className={classes.helpText}>
          Sélectionnez la ou les infractions que vous souhaitez verbaliser
        </Typography>
      )}
      {!isReportingInfractions && reportedInfractionsLastUpdateTime && (
        <Typography className={classes.helpText}>
          {`Date de la dernière modification des infractions retenues : ${prettyFormatDayHour(
            reportedInfractionsLastUpdateTime
          )}`}
        </Typography>
      )}
      <Typography align="left" className={classes.subtitle} variant="overline">
        Infractions calculées par Mobilic
      </Typography>{" "}
      <Alert severity="info">
        <Typography gutterBottom>
          Les infractions calculées par Mobilic se basent sur la version validée
          par le gestionnaire, ou, si elle n’a pas été faite au moment du
          contrôle, sur celle du salarié.
        </Typography>
      </Alert>
      {groupedAlerts?.length > 0 ? (
        <List>
          {groupedAlerts
            .sort((alert1, alert2) =>
              alert1.sanction.localeCompare(alert2.sanction)
            )
            .map(group => (
              <ListItem key={`${group.type}_${group.sanction}`} disableGutters>
                <AlertGroup
                  {...group}
                  setPeriodOnFocus={setPeriodOnFocus}
                  setTab={setTab}
                  isReportingInfractions={isReportingInfractions}
                  setReportedInfractions={setReportedInfractions}
                  readOnlyAlerts={readOnlyAlerts}
                />
              </ListItem>
            ))}
        </List>
      ) : (
        <Typography className={classes.italicInfo}>
          Il n'y a aucune alerte réglementaire sur la période
        </Typography>
      )}
      <Divider className={`hr-unstyled ${classes.divider}`} />
      {isReportingInfractions ? (
        <SubmitCancelButtons
          onSubmit={saveInfractions}
          onCancel={cancelInfractions}
        />
      ) : (
        <Alert severity="warning">
          <Typography gutterBottom>
            Les données collectées par Mobilic sont déclaratives et sont donc
            susceptibles d'erreurs ou d'oublis. En cas de données manquantes ou
            inexactes les alertes réglementaires ne peuvent pas être remontées
            correctement.
          </Typography>
          <Typography>
            Mobilic sert à faciliter le travail d'enquête des inspecteurs sans
            se substituer à lui.
          </Typography>
        </Alert>
      )}
    </Container>
  );
}
