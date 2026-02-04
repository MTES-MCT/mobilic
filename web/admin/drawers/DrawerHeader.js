import React, { useMemo } from "react";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { makeStyles } from "@mui/styles";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { fr } from "@codegouvfr/react-dsfr";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import { Typography } from "@mui/material";
import { GenericRegulatoryAlerts } from "../../regulatory/GenericRegulatoryAlerts";
import { MissionTitle } from "../components/MissionTitle";
import { RunningTag, ToValidateTag, WaitingTag } from "./Tags";
import {
  formatCompleteDayOfWeekAndDay,
  isoFormatLocalDate,
  MONDAY,
  textualPrettyFormatDay,
} from "common/utils/time";

const useStyles = makeStyles((theme) => ({
  container: {
    backgroundColor: fr.colors.decisions.background.default.grey.hover,
    paddingTop: theme.spacing(3),
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4)
  },
  workerName: {
    color: fr.colors.decisions.background.flat.blueFrance.default,
    fontWeight: "500",
    "&::before": {
      "margin-right": "10px"
    }
  },
  day: {
    color: fr.colors.decisions.background.flat.blueFrance.default,
    fontSize: "1.375rem",
    fontWeight: "bold"
  }
}));

const WorkerName = ({ name }) => {
  const classes = useStyles();
  return (
    <span
      className={cx("fr-icon--sm", "fr-icon-user-line", classes.workerName)}
    >
      {name}
    </span>
  );
};

const DrawerHeader = ({ workerName, onClose, children }) => {
  const classes = useStyles();
  return (
    <Box className={classes.container}>
      <Stack direction="column" alignItems="center" rowGap={1} pb={4}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          width="100%"
        >
          <WorkerName name={workerName} />
          <Button
            onClick={onClose}
            priority="tertiary"
            iconPosition="left"
            iconId="fr-icon-close-line"
          >
            Fermer
          </Button>
        </Stack>
        {children}
      </Stack>
    </Box>
  );
};

export const DayDrawerHeader = ({
  workerName,
  periodStart,
  userId,
  stillRunning,
  noAdminValidation,
  isDayHoliday = false,
  onClose,
}) => {
  const classes = useStyles();
  const formattedDay = formatCompleteDayOfWeekAndDay(periodStart)
  const alertsDay = isoFormatLocalDate(periodStart);
  const isStartOfWeek = new Date(periodStart * 1000).getDay() === MONDAY;
  return (
    <DrawerHeader workerName={workerName} onClose={onClose}>
      <>
        <Typography>Journée du</Typography>
        <Typography className={classes.day} mb={2}>
          {formattedDay}
        </Typography>
        {!isDayHoliday && (
        <GenericRegulatoryAlerts
          userId={userId}
          day={alertsDay}
          includeWeeklyAlerts={isStartOfWeek}
          stillRunning={stillRunning}
          noAdminValidation={noAdminValidation}
        />
        )}
      </>
    </DrawerHeader>
  );
};

export const MissionDrawerHeader = ({
  mission,
  noEmployeeValidation,
  toBeValidatedByAdmin,
  onEditMissionName,
  doesMissionSpanOnMultipleDays = false,
  onClose,
}) => {
  const stillRunning = !mission.isComplete;
  const { name: missionName, isHoliday, startTime } = mission;
  const formattedDay =
    mission.name &&
    (mission.startTime || day) &&
    doesMissionSpanOnMultipleDays &&
    !(mission.isDeleted && !mission.isComplete)
      ? `Du ${textualPrettyFormatDay(mission.startTime || day)} au ${textualPrettyFormatDay(mission.endTimeOrNow)}`
      : formatCompleteDayOfWeekAndDay(startTime);

  const workerName = useMemo(() => {
    if (!mission?.userStats) {
      return "";
    }
    const values = Object.values(mission.userStats);
    if (values.length === 0) {
      return "";
    }
    const { firstName, lastName } = values[0].user;
    return `${firstName} ${lastName}`;
  }, [mission]);

  return (
    <DrawerHeader workerName={workerName} onClose={onClose}>
      <>
        <Typography>{formattedDay}</Typography>
        <MissionTitle
          name={missionName}
          startTime={startTime}
          onEdit={onEditMissionName}
          missionPrefix={!isHoliday}
          mb={1}
        />
        {!isHoliday &&
          (stillRunning ? (
            <RunningTag />
          ) : (
            <>
              {noEmployeeValidation && <WaitingTag />}
              {!noEmployeeValidation && toBeValidatedByAdmin && (
          <ToValidateTag />
        )}
            </>
          ))}
      </>
    </DrawerHeader>
  );
};
