import React from "react";
import Typography from "@mui/material/Typography";
import { makeStyles } from "@mui/styles";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import List from "@mui/material/List";
import { AlertGroup } from "./AlertGroup";
import { prettyFormatDayHour } from "common/utils/time";
import Stack from "@mui/material/Stack";
import { Button } from "@codegouvfr/react-dsfr/Button";
import Notice from "../../common/Notice";

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
    color: theme.palette.grey[600],
    marginTop: theme.spacing(2)
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

const HELPER_TEXT_SEVERAL_INFRACTIONS =
  "Sélectionnez la ou les infractions que vous souhaitez verbaliser";
const HELPER_TEXT_SINGLE_INFRACTION =
  "Sélectionnez l’infraction si vous souhaitez la verbaliser";

export const WarningComputedAlerts = () => (
  <Notice
    description="Les infractions calculées par Mobilic se basent sur la version
              validée par le gestionnaire, ou, si elle n’a pas été faite au
              moment du contrôle, sur celle du salarié."
  />
);

export function UserReadAlerts({
  setTab,
  groupedAlerts,
  totalAlertsNumber,
  setPeriodOnFocus,
  isReportingInfractions,
  saveInfractions,
  cancelInfractions,
  onUpdateInfraction,
  reportedInfractionsLastUpdateTime,
  readOnlyAlerts,
  businesses,
  noLic
}) {
  const classes = useStyles();

  return (
    <Container maxWidth="md" className={classes.container}>
      {isReportingInfractions && (
        <Typography className={classes.helpText}>
          {totalAlertsNumber === 1
            ? HELPER_TEXT_SINGLE_INFRACTION
            : HELPER_TEXT_SEVERAL_INFRACTIONS}
        </Typography>
      )}
      {!isReportingInfractions && reportedInfractionsLastUpdateTime && (
        <Typography className={classes.helpText}>
          {`Date de la dernière modification des infractions retenues : ${prettyFormatDayHour(
            reportedInfractionsLastUpdateTime
          )}`}
        </Typography>
      )}
      {!noLic && (
        <>
          <Typography
            align="left"
            className={classes.subtitle}
            variant="overline"
            component="h2"
          >
            Infractions calculées par Mobilic
          </Typography>{" "}
          <WarningComputedAlerts />
          {businesses && businesses.length > 1 && (
            <Notice
              type="warning"
              sx={{ marginTop: 1 }}
              description={
                <>{`Attention, veuillez noter que ce salarié effectue des missions pour différents secteurs d’activité 
              (${businesses.join(", ")}).`}</>
              }
            />
          )}
        </>
      )}
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
                  onUpdateInfraction={onUpdateInfraction}
                  readOnlyAlerts={readOnlyAlerts}
                  titleProps={{ component: "h3" }}
                />
              </ListItem>
            ))}
        </List>
      ) : (
        <Typography className={classes.italicInfo}>
          Il n'y a aucune alerte réglementaire sur la période
        </Typography>
      )}
      <>
        {isReportingInfractions ? (
          <Stack direction="row" justifyContent="flex-start" p={2} spacing={4}>
            <Button onClick={() => saveInfractions()}>Valider</Button>
            <Button onClick={() => cancelInfractions()} priority="secondary">
              Annuler
            </Button>
          </Stack>
        ) : (
          !noLic && (
            <Notice
              type="warning"
              description={
                <>
                  Les données collectées par Mobilic sont déclaratives et sont
                  donc susceptibles d'erreurs ou d'oublis. En cas de données
                  manquantes ou inexactes les alertes réglementaires ne peuvent
                  pas être remontées correctement.
                  <br />
                  Mobilic sert à faciliter le travail d'enquête des inspecteurs
                  sans se substituer à lui.
                </>
              }
            />
          )
        )}
      </>
      <Divider className={`hr-unstyled ${classes.divider}`} />
    </Container>
  );
}
