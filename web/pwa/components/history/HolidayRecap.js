import Grid from "@mui/material/Grid";
import React from "react";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import { makeStyles } from "@mui/styles";
import Stack from "@mui/material/Stack";
import DateRangeIcon from "@mui/icons-material/DateRange";
import { formatRangeString } from "../WorkTimeSummary";
import { formatTimer, prettyFormatDay } from "common/utils/time";
import { FieldTitle } from "../../../common/typography/FieldTitle";

export const useStyles = makeStyles(theme => ({
  title: {
    fontWeight: "bold",
    fontSize: "1.375rem"
  },
  container: {
    textAlign: "left",
    padding: theme.spacing(2)
  },
  icon: {
    color: theme.palette.primary.main
  }
}));

export function HolidayRecap({ mission }) {
  const classes = useStyles();
  const deletedInfo = React.useMemo(
    () =>
      mission.isDeleted
        ? `(supprimé(e) le ${prettyFormatDay(mission.deletedAt, true)} par ${
            mission.deletedBy
          })`
        : "",
    [mission]
  );
  return (
    <Grid item xs={12} sm={6}>
      <Card className={classes.container}>
        <Stack direction="row" spacing={1} className={classes.icon} mb={2}>
          <DateRangeIcon />
          <Typography>Congé ou absence {deletedInfo}</Typography>
        </Stack>
        <FieldTitle uppercaseTitle>Motif Renseigné</FieldTitle>
        <Typography className={classes.title} sx={{ marginBottom: 2 }}>
          {mission.name}
        </Typography>
        <FieldTitle>
          {formatRangeString(mission.startTime, mission.endTime)} (
          {formatTimer(mission.endTime - mission.startTime)})
        </FieldTitle>
      </Card>
    </Grid>
  );
}
