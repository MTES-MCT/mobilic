import React from "react";

import { makeStyles } from "@mui/styles";

import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { CardActionArea } from "@mui/material";
import { formatDateTime } from "common/utils/time";
import { SubmitCancelButtons } from "../../../common/SubmitCancelButtons";

const useStyles = makeStyles(theme => ({
  infractionBox: {
    maxWidth: "345px"
  },
  selected: {
    borderColor: theme.palette.primary.main,
    border: "2px solid"
  }
}));

export function ControllerControlNoLicInfractionsComponent({
  infractions,
  lastInfractionsEditionDate,
  isReportingInfractions,
  toggleInfraction,
  saveInfractions,
  cancelInfractions
}) {
  const classes = useStyles();

  const getChipLabel = infraction => {
    if (isReportingInfractions || !lastInfractionsEditionDate) {
      return "1";
    }
    return infraction.selected ? "1/1" : "0/1";
  };
  return (
    <Stack
      direction="column"
      alignItems="center"
      sx={{ width: "100%" }}
      paddingX={3}
      gap={1}
    >
      {isReportingInfractions && (
        <Typography variant="h6">
          Sélectionnez l'infraction si vous souhaitez la verbaliser
        </Typography>
      )}
      {!isReportingInfractions && lastInfractionsEditionDate && (
        <Typography variant="h6">
          {`Dernière modification de l'infraction retenue : le ${formatDateTime(
            lastInfractionsEditionDate
          )}`}
        </Typography>
      )}
      {infractions.map(infraction => (
        <Card
          key={infraction.code}
          className={`${classes.infractionBox} ${isReportingInfractions &&
            infraction.selected &&
            classes.selected}`}
          variant="outlined"
        >
          <CardActionArea
            disabled={!isReportingInfractions}
            onClick={() => toggleInfraction(infraction)}
          >
            <CardContent>
              <Typography
                gutterBottom
                variant="h5"
                component="div"
                color="primary"
              >
                {infraction.code}
              </Typography>
              <Stack direction="row">
                <Typography variant="h5">{infraction.description}</Typography>
                <Chip
                  label={getChipLabel(infraction)}
                  color="error"
                  size="small"
                  sx={{ fontWeight: "bold" }}
                />
              </Stack>
            </CardContent>
          </CardActionArea>
        </Card>
      ))}
      {isReportingInfractions && (
        <SubmitCancelButtons
          onSubmit={saveInfractions}
          onCancel={cancelInfractions}
        />
      )}
    </Stack>
  );
}
