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
import { ButtonsGroup } from "@codegouvfr/react-dsfr/ButtonsGroup";

import { FieldTitle } from "../../common/typography/FieldTitle";
import { DisplayBusinessTypes } from "./Alerts/BusinessTypesFromGroupedAlerts";
import { getBusinessTypesFromGroupedAlerts } from "../utils/businessTypesFromGroupedAlerts";
import { Description } from "../../common/typography/Description";
import { CONTROL_TYPES } from "../../controller/utils/useReadControlData";
import { useInfractions } from "../../controller/utils/contextInfractions";
import { sanctionComparator } from "../utils/sanctionComparator";
import { useControl } from "../../controller/utils/contextControl";

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
  },
  bottomButtons: {
    position: "sticky",
    bottom: "-20px",
    background: "white",
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    zIndex: 300
  }
}));

const HELPER_TEXT_SEVERAL_INFRACTIONS = (
  <>Sélectionnez la ou les infractions que vous souhaitez verbaliser&nbsp;:</>
);
const HELPER_TEXT_SINGLE_INFRACTION = (
  <>Sélectionnez l’infraction si vous souhaitez la verbaliser&nbsp;:</>
);
const HELPER_TEXT_LIC_PAPIER = (
  <>
    Sélectionnez les infractions que vous souhaitez verbaliser à partir du
    livret individuel de contrôle présenté&nbsp;:
  </>
);

export const WarningComputedAlerts = () => (
  <Notice
    description="Les infractions calculées par Mobilic se basent sur la version
              validée par le gestionnaire, ou, si elle n’a pas été faite au
              moment du contrôle, sur celle du salarié."
  />
);

export function UserReadAlerts({
  onChangeTab,
  setPeriodOnFocus,
  readOnlyAlerts,
  groupedAlerts = undefined
}) {
  const classes = useStyles();
  const {
    groupedAlerts: infractionsGroupedAlerts,
    isReportingInfractions,
    totalAlertsNumber,
    reportedInfractionsLastUpdateTime,
    saveInfractions,
    cancelInfractions,
    setIsReportingInfractions
  } = useInfractions();
  const { controlType } = useControl();

  const reportInfraction = () => {
    setIsReportingInfractions(true);
  };

  const _groupedAlerts = groupedAlerts ?? infractionsGroupedAlerts;
  const businessTypes = React.useMemo(
    () => getBusinessTypesFromGroupedAlerts(_groupedAlerts),
    [_groupedAlerts]
  );

  const updateInfractionsTitle = React.useMemo(
    () =>
      controlType === CONTROL_TYPES.LIC_PAPIER.label
        ? HELPER_TEXT_LIC_PAPIER
        : totalAlertsNumber === 1
        ? HELPER_TEXT_SINGLE_INFRACTION
        : HELPER_TEXT_SEVERAL_INFRACTIONS,
    [totalAlertsNumber, controlType]
  );

  return (
    <Container maxWidth="md" sx={{ padding: 0 }}>
      {controlType === CONTROL_TYPES.MOBILIC.label && (
        <DisplayBusinessTypes businessTypes={businessTypes} />
      )}
      <Container className={classes.container}>
        <Stack direction="column" rowGap={1}>
          {isReportingInfractions && (
            <Typography>{updateInfractionsTitle}</Typography>
          )}
          {!isReportingInfractions && (
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography component="h2" fontWeight="bold" fontSize="1.125rem">
                Infractions retenues
              </Typography>
              <Button
                priority="primary"
                onClick={reportInfraction}
                disabled={false}
                size="small"
              >
                Modifier
              </Button>
            </Stack>
          )}
          {!isReportingInfractions && reportedInfractionsLastUpdateTime && (
            <Description noMargin>
              {`Date de la dernière modification des infractions retenues : ${prettyFormatDayHour(
                reportedInfractionsLastUpdateTime
              )}`}
            </Description>
          )}
          {controlType === CONTROL_TYPES.MOBILIC.label && (
            <>
              <FieldTitle uppercaseTitle component="h2">
                Infractions calculées par Mobilic
              </FieldTitle>
              <WarningComputedAlerts />
            </>
          )}
          {_groupedAlerts?.length > 0 ? (
            <List>
              {_groupedAlerts.sort(sanctionComparator).map(group => (
                <ListItem
                  key={`${group.type}_${group.sanction}`}
                  disableGutters
                  disablePadding
                  sx={{ marginBottom: "8px" }}
                >
                  <AlertGroup
                    {...group}
                    setPeriodOnFocus={setPeriodOnFocus}
                    onChangeTab={onChangeTab}
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
            {!isReportingInfractions &&
              controlType === CONTROL_TYPES.MOBILIC.label && (
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
              )}
          </>
          <Divider className={`hr-unstyled ${classes.divider}`} />
        </Stack>
      </Container>
      {isReportingInfractions && (
        <ButtonsGroup
          className={classes.bottomButtons}
          buttons={[
            {
              onClick: () => saveInfractions(),
              children: "Enregistrer"
            },
            {
              children: "Annuler",
              onClick: () => cancelInfractions(),
              priority: "secondary"
            }
          ]}
          inlineLayoutWhen="sm and up"
          alignment="right"
        />
      )}
    </Container>
  );
}
