import React from "react";
import Typography from "@mui/material/Typography";
import { makeStyles } from "@mui/styles";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import List from "@mui/material/List";
import { prettyFormatDayHour } from "common/utils/time";
import Stack from "@mui/material/Stack";
import { Button } from "@codegouvfr/react-dsfr/Button";
import Notice from "../../common/Notice";
import { AlertGroup } from "./Alerts/AlertGroup";

import { FieldTitle } from "../../common/typography/FieldTitle";
import { DisplayBusinessTypes } from "./Alerts/BusinessTypesFromGroupedAlerts";
import { getBusinessTypesFromGroupedAlerts } from "../utils/businessTypesFromGroupedAlerts";
import { Description } from "../../common/typography/Description";
import { CONTROL_TYPES } from "../../controller/utils/useReadControlData";
import { useInfractions } from "../../controller/utils/contextInfractions";

const useStyles = makeStyles(theme => ({
  container: {
    paddingBottom: theme.spacing(4),
    marginTop: theme.spacing(2),
    [theme.breakpoints.up("sm")]: {
      paddingLeft: theme.spacing(0),
      paddingRight: theme.spacing(0)
    }
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
  setPeriodOnFocus,
  readOnlyAlerts,
  controlType
}) {
  const classes = useStyles();
  const {
    groupedAlerts,
    isReportingInfractions,
    totalAlertsNumber,
    reportedInfractionsLastUpdateTime,
    saveInfractions,
    cancelInfractions
  } = useInfractions();

  const businessTypes = React.useMemo(
    () => getBusinessTypesFromGroupedAlerts(groupedAlerts),
    [groupedAlerts]
  );

  return (
    <Container maxWidth="md" sx={{ padding: 0 }}>
      {controlType === CONTROL_TYPES.MOBILIC.label && (
        <DisplayBusinessTypes businessTypes={businessTypes} />
      )}
      <Container className={classes.container}>
        <Stack direction="column" rowGap={1}>
          {isReportingInfractions && (
            <Typography>
              {totalAlertsNumber === 1
                ? HELPER_TEXT_SINGLE_INFRACTION
                : HELPER_TEXT_SEVERAL_INFRACTIONS
              // TODO 835 update sentence
              }
            </Typography>
          )}
          {!isReportingInfractions && (
            <Typography component="h2" fontWeight="bold" fontSize="1.125rem">
              Infractions retenues
            </Typography>
          )}
          {!isReportingInfractions && reportedInfractionsLastUpdateTime && (
            <Description>
              {`Date de la dernière modification des infractions retenues : ${prettyFormatDayHour(
                reportedInfractionsLastUpdateTime
              )}`}
            </Description>
          )}
          {controlType === CONTROL_TYPES.MOBILIC.label && (
            <>
              <FieldTitle uppercaseTitle component="h2" sx={{ marginTop: 2 }}>
                Infractions calculées par Mobilic
              </FieldTitle>
              <WarningComputedAlerts />
            </>
          )}
          {groupedAlerts?.length > 0 ? (
            <List>
              {groupedAlerts
                .sort((alert1, alert2) =>
                  alert1.sanction.localeCompare(alert2.sanction)
                )
                .map(group => (
                  <ListItem
                    key={`${group.type}_${group.sanction}`}
                    disableGutters
                  >
                    <AlertGroup
                      {...group}
                      controlType={controlType}
                      setPeriodOnFocus={setPeriodOnFocus}
                      setTab={setTab}
                      readOnlyAlerts={readOnlyAlerts}
                      titleProps={{ component: "h3" }}
                      displayBusinessType={
                        businessTypes && businessTypes.length > 1
                      }
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
              <Stack
                direction="row"
                justifyContent="flex-start"
                p={2}
                spacing={4}
              >
                <Button onClick={() => saveInfractions()}>Valider</Button>
                <Button
                  onClick={() => cancelInfractions()}
                  priority="secondary"
                >
                  Annuler
                </Button>
              </Stack>
            ) : (
              controlType === CONTROL_TYPES.MOBILIC && (
                <Notice
                  type="warning"
                  description={
                    <>
                      Les données collectées par Mobilic sont déclaratives et
                      sont donc susceptibles d'erreurs ou d'oublis. En cas de
                      données manquantes ou inexactes les alertes réglementaires
                      ne peuvent pas être remontées correctement.
                      <br />
                      Mobilic sert à faciliter le travail d'enquête des
                      inspecteurs sans se substituer à lui.
                    </>
                  }
                />
              )
            )}
          </>
          <Divider className={`hr-unstyled ${classes.divider}`} />
        </Stack>
      </Container>
    </Container>
  );
}
