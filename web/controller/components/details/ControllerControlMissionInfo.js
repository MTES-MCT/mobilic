import React from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import DriveEtaIcon from "@mui/icons-material/DirectionsCar";
import BusinessIcon from "@mui/icons-material/Business";
import ListItemIcon from "@mui/material/ListItemIcon";
import Notice from "../../../common/Notice";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles(() => ({
  fieldValue: {
    fontWeight: 500,
    fontSize: "1rem",
    whiteSpace: "inherit"
  }
}));

export function ControllerControlMissionInfo({
  vehicleRegistrationNumber,
  companyName
}) {
  const classes = useStyles();

  return (
    <Stack direction="column">
      <Typography variant="h6" component="h2">
        Mission lors du contrôle
      </Typography>

      <Grid container spacing={2}>
        <List dense>
          <ListItem disableGutters>
            <ListItemIcon>
              <DriveEtaIcon />
            </ListItemIcon>
            <Typography noWrap align="left" className={classes.fieldValue}>
              {vehicleRegistrationNumber || "Non renseigné"}
            </Typography>
          </ListItem>
          <ListItem disableGutters>
            <ListItemIcon>
              <BusinessIcon />
            </ListItemIcon>
            <Typography noWrap align="left" className={classes.fieldValue}>
              {companyName}
            </Typography>
          </ListItem>
        </List>
      </Grid>

      {!companyName && (
        <Notice
          type="warning"
          description="Aucune saisie en cours au moment du contrôle"
        />
      )}
    </Stack>
  );
}
