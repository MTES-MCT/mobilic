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
    reportableAlert: {
      backgroundColor: theme.palette.error.main
    },
    notReportableAlert: {
      backgroundColor: theme.palette.primary.main
    }
  };
});

const getAlertsNumber = (
  alerts,
  isSanctionReportable,
  isReportingInfractions,
  readOnlyAlerts
) =>
  readOnlyAlerts || !isSanctionReportable
    ? alerts.length
    : isReportingInfractions
    ? `${alerts.filter(alert => alert.checked).length} / ${alerts.length}`
    : alerts.filter(alert => alert.checked).length;

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
  isReportingInfractions,
  onUpdateInfraction,
  readOnlyAlerts,
  displayBusinessType = false,
  titleProps = {}
}) {
  const [open, setOpen] = React.useState(false);
  const classes = useStyles();

  const isSanctionReportable = readOnlyAlerts ? true : isReportable(sanction);

  const alertsNumber = getAlertsNumber(
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
            <Typography className="bold" color="primary" {...titleProps}>
              {sanction}
            </Typography>
            <Typography className="bold">{infringementLabel}</Typography>
          </Grid>
          {alertsNumber !== 0 && (
            <Grid item>
              <span
                className={`${classes.alertNumber} ${
                  isSanctionReportable
                    ? classes.reportableAlert
                    : classes.notReportableAlert
                }`}
              >
                {alertsNumber}
              </span>
            </Grid>
          )}
        </Grid>
      </AccordionSummary>
      <AccordionDetails className={classes.details}>
        {Object.entries(alertsGroupedByBusinessTypes).map(
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
                        isReportingInfractions={isReportingInfractions}
                        onUpdateInfraction={onUpdateInfraction}
                        readOnlyAlerts={readOnlyAlerts}
                      />
                    </ListItem>
                  ))}
                </List>
              </React.Fragment>
            );
          }
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
