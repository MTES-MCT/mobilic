import React from "react";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { makeStyles } from "@mui/styles";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { fr } from "@codegouvfr/react-dsfr";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import { Typography } from "@mui/material";
import {
  formatCompleteDayOfWeek,
  isoFormatLocalDate,
  prettyFormatDay
} from "common/utils/time";
import { GenericRegulatoryAlerts } from "../../regulatory/GenericRegulatoryAlerts";

const useStyles = makeStyles((theme) => ({
  container: {
    backgroundColor: fr.colors.decisions.background.default.grey.hover,
    paddingTop: theme.spacing(3),
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4)
  },
  workerName: {
    color: fr.colors.decisions.background.flat.blueFrance.default,
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

export const DrawerHeader = ({
  workerName,
  periodStart,
  userId,
  stillRunning,
  onClose
}) => {
  const classes = useStyles();
  const formattedDay = `${formatCompleteDayOfWeek(periodStart)} ${prettyFormatDay(periodStart, true)}`;
  const alertsDay = isoFormatLocalDate(periodStart);
  const isStartOfWeek = new Date(periodStart * 1000).getDay() === 1;
  return (
    <Box className={classes.container}>
      <Stack direction="column" alignItems="center" rowGap={1} mb={4}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          width="100%"
        >
          <span
            className={cx(
              "fr-icon--sm",
              "fr-icon-user-line",
              classes.workerName
            )}
          >
            {workerName}
          </span>
          <Button
            onClick={onClose}
            priority="tertiary"
            iconPosition="left"
            iconId="fr-icon-close-line"
          >
            Fermer
          </Button>
        </Stack>
        <Typography>Journée du</Typography>
        <Typography className={classes.day} mb={1}>
          {formattedDay}
        </Typography>
        <GenericRegulatoryAlerts
          userId={userId}
          day={alertsDay}
          includeWeeklyAlerts={isStartOfWeek}
          stillRunning={stillRunning}
        />
      </Stack>
    </Box>
  );
};
