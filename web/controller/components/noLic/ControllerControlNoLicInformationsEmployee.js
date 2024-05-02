import React from "react";
import { makeStyles } from "@mui/styles";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import DriveEtaIcon from "@mui/icons-material/DirectionsCar";
import BusinessIcon from "@mui/icons-material/Business";
import ListItemIcon from "@mui/material/ListItemIcon";
import { InfoItem } from "../../../home/InfoField";

const useStyles = makeStyles(theme => ({
  sectionBody: {
    marginBottom: theme.spacing(6)
  },
  subSectionBody: {
    marginBottom: theme.spacing(2)
  },
  fieldValue: {
    fontWeight: 500,
    fontSize: "1rem",
    whiteSpace: "inherit"
  }
}));

export function ControllerControlNoLicInformationsEmployee({ controlData }) {
  const classes = useStyles();
  return (
    <Grid container spacing={2} className={classes.sectionBody} p={1}>
      <Typography variant="h5" component="h2">
        Informations salarié(e)
      </Typography>
      <Grid
        container
        wrap="wrap"
        spacing={2}
        className={classes.subSectionBody}
      >
        <Grid item xs={6}>
          <InfoItem
            name="Nom"
            value={controlData.userLastName}
            titleProps={{
              component: "h3"
            }}
          />
        </Grid>
        <Grid item xs={6}>
          <InfoItem
            name="Prénom"
            value={controlData.userFirstName}
            titleProps={{
              component: "h3"
            }}
          />
        </Grid>
      </Grid>
      <Typography variant="h5" component="h2">
        Mission lors du contrôle
      </Typography>
      <Grid
        container
        wrap="wrap"
        spacing={2}
        className={classes.subSectionBody}
      >
        <Grid item xs={12}>
          <List dense>
            <ListItem disableGutters>
              <ListItemIcon>
                <DriveEtaIcon />
              </ListItemIcon>
              <Typography noWrap align="left" className={classes.fieldValue}>
                {controlData.vehicleRegistrationNumber || "Non renseigné"}
              </Typography>
            </ListItem>
            <ListItem disableGutters>
              <ListItemIcon>
                <BusinessIcon />
              </ListItemIcon>
              <Typography noWrap align="left" className={classes.fieldValue}>
                {controlData.companyName || "Non renseigné"}
              </Typography>
            </ListItem>
          </List>
        </Grid>
      </Grid>
    </Grid>
  );
}
