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
import { fr } from "@codegouvfr/react-dsfr";
import { Button } from "@codegouvfr/react-dsfr/Button";
import Hidden from "@mui/material/Hidden";
import { MissionInfoCard } from "./MissionInfoCard";
import { useCacheContradictoryInfoInAdminStore } from "common/utils/contradictory";
import { getNextHeadingComponent } from "common/utils/html";
import { AdminMissionValidations } from "./AdminMissionValidations";
import { MissionValidations } from "../../pwa/components/MissionValidations";
import Notice from "../../common/Notice";

const useStyles = makeStyles(theme => ({
  cardRecapKPIContainer: {
    flexGrow: 1
  },
  cardRecapKPI: {
    height: "100%",
    borderBottom: `4px solid ${fr.colors.decisions.text.default.grey.default}`,
    "& .MuiStack-root": {
      gap: "12px !important"
    }
  },
  workDurationCaption: {
    color: theme.palette.grey[500]
  },
  runningMissionText: {
    color: theme.palette.warning.main,
    fontWeight: "bold"
  },
  flatCard: {
    border: "none !important",
    padding: "0 !important",
    boxShadow: "none !important"
  },
  sectionSpacing: {
    marginTop: theme.spacing(5)
  },
  userNameRow: {
    display: "flex",
    alignItems: "center",
    marginBottom: 32
  },
  userName: {
    fontWeight: 700,
    fontSize: 24,
    lineHeight: "32px",
    color: fr.colors.decisions.text.title.blueFrance.default
  },
  removeButton: {
    marginLeft: "auto"
  },
  statusTag: {
    marginLeft: theme.spacing(2),
    "& .fr-tag": {
      padding: "4px 12px",
      height: 32,
      borderRadius: 16,
      fontSize: 14,
      fontWeight: 400,
      lineHeight: "24px"
    }
  },
  alwaysOpenContainer: {
    width: "100%"
  },
  accordionDetails: {
    display: "block"
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
  alwaysOpen = false,
  showUserName = false,
  simplified = false,
  headingComponent,
  overrideValidation = null,
  statusTag = null
}) {
  const stats = mission.userStats[user.id.toString()] || {};
  const activities = stats.activities || [];

  const [open, setOpen] = React.useState(alwaysOpen || defaultOpen);

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

  const cardContent = (
    <Grid container direction="column" wrap="nowrap">
      {!isDeleted &&
        !alwaysOpen &&
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
      {(showUserName || (activities.length === 0 && removeUser)) && (
        <div className={classes.userNameRow}>
          {showUserName && (
            <>
              <Typography
                component={headingComponent || "h3"}
                className={classes.userName}
              >
                {formatPersonName(user)}
              </Typography>
              {statusTag && (
                <span className={classes.statusTag}>{statusTag}</span>
              )}
            </>
          )}
          {activities.length === 0 && removeUser && (
            <Button
              className={classes.removeButton}
              priority="tertiary"
              size="small"
              iconId="fr-icon-delete-line"
              iconPosition="right"
              onClick={removeUser}
            >
              Retirer
            </Button>
          )}
        </div>
      )}
      <Grid item container spacing={3} alignItems="stretch">
        <Grid xs={12} sm={6} item className={classes.cardRecapKPIContainer}>
          <MetricCard
            className={classes.cardRecapKPI}
            textAlign="center"
            py={3}
            variant="outlined"
            title="Amplitude"
            titleProps={{
              variant: "h5",
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
            py={3}
            variant="outlined"
            title="Temps de travail"
            titleProps={{
              variant: "h5",
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
      <Grid item xs={12} className={classes.sectionSpacing}>
        <ActivitiesCard
          cardClassName={classes.flatCard}
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
          allowSupportActivity={
            mission?.company?.settings?.requireSupportActivity ?? true
          }
          mission={mission}
          cacheContradictoryInfoInStore={cacheContradictoryInfoInAdminStore}
          simplified={simplified}
        />
      </Grid>
      {showExpenditures && (
        <Grid item xs={12} className={classes.sectionSpacing}>
          <ExpendituresCard
            cardClassName={classes.flatCard}
            title="Frais"
            expenditures={stats.expenditures || []}
            editModalTitle={`Frais pour ${formatPersonName(user)}`}
            onEditExpenditures={onEditExpenditures}
            minSpendingDate={stats.startTime}
            maxSpendingDate={stats.endTime}
            titleProps={{
              variant: "h5",
              component: getNextHeadingComponent(headingComponent)
            }}
          />
        </Grid>
      )}
      {alwaysOpen && (
        <Grid item xs={12} className={classes.sectionSpacing}>
          <MissionInfoCard
            className={classes.flatCard}
            title="Historique des validations"
            titleProps={{
              variant: "h5",
              component: getNextHeadingComponent(headingComponent)
            }}
          >
            {isAdminBypassingEmployeeValidation && (
              <Notice
                type="warning"
                description={
                  <>La validation par le salarié n'a pas eu lieu pour </>
                }
                linkText="l'une des raisons suivantes."
                linkUrl="https://faq.mobilic.beta.gouv.fr/usages-et-fonctionnement-de-mobilic/suivi-et-validation-du-temps-de-travail#en-tant-que-gestionnaire-je-peux-uniquement-modifier-et-valider-les-missions-validees-par-les-salari"
              />
            )}
            <AdminMissionValidations
              mission={mission}
              validations={stats.validations}
              userId={user.id}
            />
          </MissionInfoCard>
        </Grid>
      )}
    </Grid>
  );

  if (alwaysOpen) {
    return (
      <div className={`${className} ${classes.alwaysOpenContainer}`}>
        {cardContent}
      </div>
    );
  }

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
            {!open &&
              activities.length > 0 && [
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
                )
              ]}
          </Grid>
          {activities.length === 0 && removeUser && (
            <Grid item>
              <Button
                priority="tertiary"
                size="small"
                iconId="fr-icon-delete-line"
                iconPosition="right"
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  removeUser();
                }}
              >
                Retirer
              </Button>
            </Grid>
          )}
        </Grid>
      </AccordionSummary>
      <AccordionDetails className={classes.accordionDetails}>
        {cardContent}
      </AccordionDetails>
    </Accordion>
  );
}
