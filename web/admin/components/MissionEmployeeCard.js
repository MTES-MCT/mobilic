import React from "react";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import Accordion from "@material-ui/core/Accordion";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { formatPersonName } from "common/utils/coworkers";
import Typography from "@material-ui/core/Typography";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Grid from "@material-ui/core/Grid";
import { MetricCard } from "../../common/InfoCard";
import { formatTimer, useDateTimeFormatter } from "common/utils/time";
import { ExpendituresCard } from "./ExpendituresCard";
import { ActivitiesCard } from "./ActivitiesCard";
import {
  addBreaksToActivityList,
  computeDurationAndTime
} from "common/utils/activities";
import makeStyles from "@material-ui/core/styles/makeStyles";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import { MissionValidationInfo } from "./MissionValidationInfo";
import Hidden from "@material-ui/core/Hidden";

const useStyles = makeStyles(theme => ({
  cardRecapKPIContainer: {
    flexGrow: 1
  },
  cardRecapKPI: {
    height: "100%"
  },
  workDurationCaption: {
    color: theme.palette.grey[500]
  }
}));

export function MissionEmployeeCard({
  className,
  mission,
  user,
  onCreateActivity,
  onEditActivity,
  onDeleteActivity,
  day,
  showExpenditures,
  onEditExpenditures,
  removeUser,
  defaultOpen = false
}) {
  const stats = mission.userStats[user.id.toString()] || {};
  const activities = stats.activities || [];

  const [open, setOpen] = React.useState(defaultOpen);

  const classes = useStyles();

  // Add breaks
  const activitiesWithBreaks = addBreaksToActivityList(activities);
  // Compute duration and end time for each activity
  const augmentedAndSortedActivities = computeDurationAndTime(
    activitiesWithBreaks
  );

  const datetimeFormatter = useDateTimeFormatter(
    augmentedAndSortedActivities,
    false
  );

  return (
    <Accordion
      variant="outlined"
      className={className}
      expanded={open}
      onChange={(event, open_) => setOpen(open_)}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Grid
          container
          spacing={3}
          justify="space-between"
          alignItems="center"
          wrap="nowrap"
        >
          <Grid item container spacing={3} alignItems="center" wrap="nowrap">
            <Grid item>
              <Typography>{formatPersonName(user)}</Typography>
            </Grid>
            {!open &&
              activities.length > 0 && [
                <Hidden xsDown key={1}>
                  <Grid item>
                    <Typography
                      variant="caption"
                      className={classes.workDurationCaption}
                    >
                      Temps de travail : {formatTimer(stats.totalWorkDuration)}
                    </Typography>
                  </Grid>
                </Hidden>,
                <Hidden key={2} xsDown>
                  <Grid item>
                    <Typography
                      variant="caption"
                      className={classes.workDurationCaption}
                    >
                      Début : {datetimeFormatter(stats.startTime)}
                    </Typography>
                  </Grid>
                </Hidden>,
                stats.endTime && (
                  <Hidden key={3} xsDown>
                    <Grid item>
                      <Typography
                        variant="caption"
                        className={classes.workDurationCaption}
                      >
                        Fin : {datetimeFormatter(stats.endTime)}
                      </Typography>
                    </Grid>
                  </Hidden>
                )
              ]}
          </Grid>
          {activities.length === 0 && (
            <Grid item>
              <IconButton
                className="no-margin-no-padding"
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  removeUser();
                }}
              >
                <CloseIcon />
              </IconButton>
            </Grid>
          )}
        </Grid>
      </AccordionSummary>
      <AccordionDetails style={{ display: "block" }}>
        <Grid container spacing={2} direction="column" wrap="nowrap">
          <Grid item>
            <MissionValidationInfo validation={stats.validation} />
          </Grid>
          <Grid item container spacing={2} alignItems="stretch">
            <Grid xs={12} sm={6} item className={classes.cardRecapKPIContainer}>
              <MetricCard
                className={classes.cardRecapKPI}
                center
                py={2}
                variant="outlined"
                title="Amplitude"
                value={formatTimer(stats.service)}
                valueProps={{ variant: "body1" }}
                subText={
                  stats.startTime
                    ? `de ${datetimeFormatter(stats.startTime)} à
                  ${datetimeFormatter(stats.endTime)}`
                    : ""
                }
              />
            </Grid>
            <Grid xs={12} sm={6} item className={classes.cardRecapKPIContainer}>
              <MetricCard
                className={classes.cardRecapKPI}
                center
                py={2}
                variant="outlined"
                title="Temps de travail"
                value={formatTimer(stats.totalWorkDuration)}
                valueProps={{ variant: "body1" }}
              />
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <ActivitiesCard
              activities={augmentedAndSortedActivities}
              onCreateActivity={onCreateActivity}
              onEditActivity={onEditActivity}
              onDeleteActivity={onDeleteActivity}
              day={day}
              title="Activités"
              datetimeFormatter={datetimeFormatter}
            />
          </Grid>
          {showExpenditures && (
            <Grid item xs={12}>
              <ExpendituresCard
                title="Frais"
                expenditures={stats.expenditures || []}
                editModalTitle={`Frais pour ${formatPersonName(user)}`}
                onEditExpenditures={onEditExpenditures}
                minSpendingDate={stats.startTime}
                maxSpendingDate={stats.endTime}
              />
            </Grid>
          )}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
}
