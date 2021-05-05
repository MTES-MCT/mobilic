import React from "react";
import ListItemIcon from "@material-ui/core/ListItemIcon/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText/ListItemText";
import {
  formatAddressMainText,
  formatAddressSubText
} from "common/utils/addresses";
import Button from "@material-ui/core/Button";
import ListItem from "@material-ui/core/ListItem";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { useModals } from "common/utils/modals";

const useStyles = makeStyles(theme => ({
  kilometerReading: {
    flexGrow: 0
  }
}));

export default function LocationEntry({
  mission,
  location,
  isStart,
  editKilometerReading
}) {
  const classes = useStyles();
  const modals = useModals();

  let minReading = null;
  let maxReading = null;

  if (!isStart && mission && mission.startLocation)
    minReading = mission.startLocation.kilometerReading;

  if (isStart && mission && mission.endLocation)
    maxReading = mission.endLocation.kilometerReading;

  function handleEditKilometerReading() {
    modals.open("kilometerReading", {
      handleKilometerReading: kilometerReading => {
        if (kilometerReading !== location.kilometerReading)
          editKilometerReading({
            mission,
            location,
            kilometerReading,
            isStart
          });
      },
      currentKilometerReading: location.kilometerReading,
      minReading,
      maxReading,
      isStart
    });
  }

  return (
    <ListItem disableGutters>
      <ListItemIcon>{isStart ? "Début" : "Fin"}</ListItemIcon>
      <ListItemText
        primary={location ? formatAddressMainText(location) : null}
        secondary={location ? formatAddressSubText(location) : null}
      />
      {location && location.kilometerReading ? (
        <ListItemText
          className={classes.kilometerReading}
          primary={`km : ${location.kilometerReading}`}
          secondary={
            editKilometerReading ? (
              <Button
                className="no-margin-no-padding"
                color="primary"
                size="small"
                onClick={handleEditKilometerReading}
              >
                Modifier
              </Button>
            ) : null
          }
        />
      ) : editKilometerReading ? (
        <ListItemText className={classes.kilometerReading} disableTypography>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            onClick={handleEditKilometerReading}
          >
            Ajouter km
          </Button>
        </ListItemText>
      ) : null}
    </ListItem>
  );
}
