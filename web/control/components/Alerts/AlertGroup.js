import React from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import { formatAlertText, RegulatoryAlert } from "../RegulatoryAlert";
import { makeStyles } from "@mui/styles";
import Grid from "@mui/material/Grid";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import { groupBy } from "lodash";
import { formatActivity } from "common/utils/businessTypes";
import { Description } from "../../../common/typography/Description";
import { CONTROL_TYPES } from "../../../controller/utils/useReadControlData";
import { InfractionDay } from "./InfractionDay";
import { InfractionWeek } from "./InfractionWeek";
import { PERIOD_UNITS } from "common/utils/regulation/periodUnitsEnum";
import classNames from "classnames";
import { useInfractions } from "../../../controller/utils/contextInfractions";

const useStyles = makeStyles(theme => {
  return {
    container: {
      width: "100%"
    },
    details: {
      display: "block"
    },
    collapseToggle: {
      padding: 0,
      margin: 0,
      marginRight: theme.spacing(1)
    },
    alertNumber: {
      display: "inline-flex",
      whiteSpace: "pre",
      borderRadius: theme.spacing(1.5),
      color: "white",
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
      height: theme.spacing(3),
      minWidth: theme.spacing(3),
      alignItems: "center",
      justifyContent: "center",
      fontWeight: "bold"
    },
    reportedAlert: {
      borderColor: theme.palette.primary.main,
      borderWidth: "1px"
    },
    reportableAlert: {
      backgroundColor: theme.palette.error.main
    },
    notReportableAlert: {
      backgroundColor: theme.palette.warning.light
    }
  };
});

const getAlertsNumber = (
  controlType,
  alerts,
  isSanctionReportable,
  isReportingInfractions,
  readOnlyAlerts
) => {
  if (readOnlyAlerts || !isSanctionReportable) {
    return alerts.filter(alert => !!(alert.day || alert.week)).length;
  } else if (
    isReportingInfractions &&
    controlType === CONTROL_TYPES.MOBILIC.label
  ) {
    return `${alerts.filter(alert => alert.checked).length} / ${alerts.length}`;
  } else {
    return alerts.filter(alert => alert.checked).length;
  }
};

const isReportable = sanction => sanction.includes("NATINF");

const BusinessTypeTitle = ({ business }) => (
  <Typography className="bold" sx={{ fontSize: "0.875rem" }} mb={1}>
    Infraction(s) liée(s) au {formatActivity(business)}
    &nbsp;:
  </Typography>
);

export function AlertGroup({
  alerts,
  infringementLabel,
  type,
  sanction,
  setPeriodOnFocus,
  setTab,
  readOnlyAlerts,
  controlData,
  displayBusinessType = false,
  titleProps = {}
}) {
  const [open, setOpen] = React.useState(false);
  const classes = useStyles();
  const { isReportingInfractions } = useInfractions();

  const isSanctionReportable = readOnlyAlerts ? true : isReportable(sanction);

  const isReported = React.useMemo(
    () => alerts.filter(alert => alert.checked).length > 0,
    [alerts]
  );

  const alertsNumber = getAlertsNumber(
    controlData.controlType,
    alerts,
    isSanctionReportable,
    isReportingInfractions,
    readOnlyAlerts
  );

  const alertsGroupedByBusinessTypes = React.useMemo(
    () => groupBy(alerts, alert => alert.business.id),
    [alerts]
  );

  return (
    <Accordion
      expanded={open}
      onChange={(event, open_) => setOpen(open_)}
      variant="outlined"
      className={classNames(
        classes.container,
        isReported ? classes.reportedAlert : ""
      )}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Grid
          container
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
          wrap="nowrap"
        >
          <Grid item>
            <Typography className="bold" color="primary" {...titleProps}>
              {sanction}
            </Typography>
            <Typography className="bold">{infringementLabel}</Typography>
          </Grid>
          {alertsNumber !== 0 && (
            <Grid item>
              <span
                className={classNames(
                  classes.alertNumber,
                  isSanctionReportable
                    ? classes.reportableAlert
                    : classes.notReportableAlert
                )}
              >
                {alertsNumber}
              </span>
            </Grid>
          )}
        </Grid>
      </AccordionSummary>
      <AccordionDetails className={classes.details}>
        {/* TODO refactor: extract in another component */}
        {(controlData.controlType === CONTROL_TYPES.MOBILIC.label ||
          controlData.controlType === CONTROL_TYPES.NO_LIC.label) &&
          Object.entries(alertsGroupedByBusinessTypes).map(
            ([businessId, alertsByBusiness]) => {
              const firstAlert = alertsByBusiness[0];
              const {
                description: alertDescription,
                business: alertBusiness
              } = firstAlert;
              return (
                <React.Fragment key={`alertsByBusiness_${businessId}`}>
                  {displayBusinessType && (
                    <BusinessTypeTitle business={alertBusiness} />
                  )}
                  <Description>{alertDescription}</Description>
                  <List>
                    {alertsByBusiness.map((alert, index) => (
                      <ListItem key={index} disableGutters>
                        <RegulatoryAlert
                          alert={alert}
                          type={type}
                          sanction={sanction}
                          isReportable={isSanctionReportable}
                          setPeriodOnFocus={setPeriodOnFocus}
                          setTab={setTab}
                          readOnlyAlerts={readOnlyAlerts}
                        />
                      </ListItem>
                    ))}
                  </List>
                </React.Fragment>
              );
            }
          )}
        {controlData.controlType === CONTROL_TYPES.LIC_PAPIER.label && (
          <>
            <Description>{alerts[0].description}</Description>
            {alerts[0].unit === PERIOD_UNITS.DAY && (
              <InfractionDay
                alerts={alerts}
                sanction={sanction}
                controlData={controlData}
              />
            )}
            {alerts[0].unit === PERIOD_UNITS.WEEK && (
              <>
                <InfractionWeek
                  alerts={alerts}
                  sanction={sanction}
                  controlData={controlData}
                />
              </>
            )}
          </>
        )}
      </AccordionDetails>
    </Accordion>
  );
}

export function AlertCard({ alert }) {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  return (
    <Accordion
      expanded={open}
      onChange={(event, open_) => setOpen(open_)}
      variant="outlined"
      className={classes.container}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Grid
          container
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
          wrap="nowrap"
        >
          <Grid item>
            <Typography className="bold" color="primary">
              {alert.sanction}
            </Typography>
            <Typography className="bold">{alert.infringementLabel}</Typography>
          </Grid>
        </Grid>
      </AccordionSummary>
      <AccordionDetails className={classes.details}>
        <Typography>{formatAlertText(alert, alert.type)}</Typography>
      </AccordionDetails>
    </Accordion>
  );
}
