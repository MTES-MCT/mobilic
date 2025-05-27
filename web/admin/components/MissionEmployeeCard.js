import React from "react";
import AccordionSummary from "@mui/material/AccordionSummary";
import Accordion from "@mui/material/Accordion";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { formatPersonName } from "common/utils/coworkers";
import Typography from "@mui/material/Typography";
import AccordionDetails from "@mui/material/AccordionDetails";
import Grid from "@mui/material/Grid";
import { MetricCard } from "../../common/InfoCard";
import { formatTimer, useDateTimeFormatter } from "common/utils/time";
import { ExpendituresCard } from "./ExpendituresCard";
import { ActivitiesCard } from "./ActivitiesCard";
import {
  addBreaksToActivityList,
  computeDurationAndTime
} from "common/utils/activities";
import { makeStyles } from "@mui/styles";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Hidden from "@mui/material/Hidden";
import { MissionInfoCard } from "./MissionInfoCard";
import { ContradictoryChanges } from "../../pwa/components/ContradictoryChanges";
import { useCacheContradictoryInfoInAdminStore } from "common/utils/contradictory";
import Emoji from "../../common/Emoji";
import { getNextHeadingComponent } from "common/utils/html";
import { MissionValidations } from "../../pwa/components/MissionValidations";
import Notice from "../../common/Notice";

const useStyles = makeStyles(theme => ({
  cardRecapKPIContainer: {
    flexGrow: 1
  },
  cardRecapKPI: {
    height: "100%"
  },
  workDurationCaption: {
    color: theme.palette.grey[500]
  },
  runningMissionText: {
    color: theme.palette.warning.main,
    fontWeight: "bold"
  }
}));

export function MissionEmployeeCard({
  className,
  mission,
  user,
  onCreateActivity,
  onEditActivity,
  day,
  showExpenditures,
  onEditExpenditures,
  removeUser,
  isDeleted = false,
  defaultOpen = false,
  displayIcon = true,
  headingComponent,
  overrideValidation = null
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

  const isAdminBypassingEmployeeValidation =
    !stats.workerValidation && (onCreateActivity || stats.adminValidation);

  const datetimeFormatter = useDateTimeFormatter(
    augmentedAndSortedActivities,
    false
  );

  const cacheContradictoryInfoInAdminStore = useCacheContradictoryInfoInAdminStore();

  const adminAutoValidationOnly =
    stats.adminAutoValidation && !stats.adminManualValidation;

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
          justifyContent="space-between"
          wrap="nowrap"
        >
          <Grid item container spacing={3} wrap="nowrap">
            <Grid item>
              <Typography component={headingComponent}>
                {formatPersonName(user)}
              </Typography>
            </Grid>
            {!open &&
              activities.length > 0 && [
                !stats.isComplete && !isDeleted && (
                  <Hidden xsDown key={0}>
                    <Grid item>
                      <Typography
                        variant="caption"
                        className={`${classes.workDurationCaption} ${classes.runningMissionText}`}
                      >
                        En cours
                      </Typography>
                    </Grid>
                  </Hidden>
                ),
                <Hidden xsDown key={1}>
                  <Grid item>
                    <Typography
                      variant="caption"
                      className={classes.workDurationCaption}
                    >
                      Temps de travail :{" "}
                      {isDeleted && !stats.isComplete
                        ? "-"
                        : formatTimer(stats.totalWorkDuration)}
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
                        Fin : {datetimeFormatter(stats.endTimeOrNow)}
                      </Typography>
                    </Grid>
                  </Hidden>
                ),
                displayIcon &&
                !stats.workerValidation &&
                !stats.adminValidation ? (
                  <Grid key={4} item>
                    <Emoji emoji="⏳" ariaLabel="En attente de validation" />
                  </Grid>
                ) : null
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
          {!isDeleted &&
            (isAdminBypassingEmployeeValidation ? (
              <Notice
                type="warning"
                description={
                  <>La validation par le salarié n'a pas eu lieu pour </>
                }
                linkText="l'une des raisons suivantes."
                linkUrl="https://faq.mobilic.beta.gouv.fr/usages-et-fonctionnement-de-mobilic/suivi-et-validation-du-temps-de-travail#en-tant-que-gestionnaire-je-peux-uniquement-modifier-et-valider-les-missions-validees-par-les-salari"
              />
            ) : (
              <MissionValidations
                mission={mission}
                validations={stats.validations}
                userId={user.id}
              />
            ))}
          <Grid item container spacing={2} alignItems="stretch">
            <Grid xs={12} sm={6} item className={classes.cardRecapKPIContainer}>
              <MetricCard
                className={classes.cardRecapKPI}
                textAlign="center"
                py={2}
                variant="outlined"
                title="Amplitude"
                titleProps={{
                  variant: "h6",
                  component: getNextHeadingComponent(headingComponent)
                }}
                value={
                  !stats.isComplete && isDeleted
                    ? "-"
                    : formatTimer(stats.service)
                }
                valueProps={{
                  variant: "body1",
                  className:
                    !stats.isComplete && !isDeleted
                      ? classes.runningMissionText
                      : ""
                }}
                subText={
                  stats.startTime ? (
                    <span>
                      de {datetimeFormatter(stats.startTime)} à{" "}
                      {!stats.isComplete && isDeleted
                        ? " -"
                        : datetimeFormatter(stats.endTimeOrNow)}{" "}
                      {!stats.isComplete && !isDeleted ? (
                        <span className={classes.runningMissionText}>
                          (en cours)
                        </span>
                      ) : (
                        ""
                      )}
                    </span>
                  ) : (
                    ""
                  )
                }
              />
            </Grid>
            <Grid xs={12} sm={6} item className={classes.cardRecapKPIContainer}>
              <MetricCard
                className={classes.cardRecapKPI}
                textAlign="center"
                py={2}
                variant="outlined"
                title="Temps de travail"
                titleProps={{
                  variant: "h6",
                  component: getNextHeadingComponent(headingComponent)
                }}
                value={
                  !stats.isComplete && isDeleted
                    ? "-"
                    : formatTimer(stats.totalWorkDuration)
                }
                valueProps={{
                  variant: "body1",
                  className:
                    !stats.isComplete && !isDeleted
                      ? classes.runningMissionText
                      : ""
                }}
                subText={
                  !stats.isComplete && !isDeleted ? (
                    <span className={classes.runningMissionText}>En cours</span>
                  ) : null
                }
              />
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <ActivitiesCard
              missionDeleted={isDeleted}
              isHoliday={mission.isHoliday}
              activities={augmentedAndSortedActivities}
              onCreateActivity={onCreateActivity}
              onEditActivity={onEditActivity}
              day={day}
              title="Activités"
              datetimeFormatter={datetimeFormatter}
              titleProps={{
                variant: "h6",
                component: getNextHeadingComponent(headingComponent)
              }}
              {...(overrideValidation &&
                adminAutoValidationOnly && {
                  onActionButtonClick: overrideValidation,
                  actionButtonLabel: "J'ai été absent : modifier les saisies"
                })}
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
                titleProps={{
                  variant: "h6",
                  component: getNextHeadingComponent(headingComponent)
                }}
              />
            </Grid>
          )}
          {((stats.adminValidation && stats.workerValidation) || isDeleted) && (
            <Grid item xs={12}>
              <MissionInfoCard>
                <ContradictoryChanges
                  mission={mission}
                  validationTime={stats.workerValidation?.receptionTime}
                  showEventsBeforeValidation={isDeleted}
                  userId={user.id}
                  cacheInStore={cacheContradictoryInfoInAdminStore}
                />
              </MissionInfoCard>
            </Grid>
          )}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
}
