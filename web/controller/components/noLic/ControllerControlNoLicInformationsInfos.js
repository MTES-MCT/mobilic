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
  }
}));

export function ControllerControlNoLicInformationsInfos({ bulletinControle }) {
  const classes = useStyles();
  return bulletinControle?.touched ? (
    <Grid container spacing={2} className={classes.sectionBody} p={1}>
      <Typography variant="h5">Informations salarié(e)</Typography>
      <Grid
        container
        wrap="wrap"
        spacing={2}
        className={classes.subSectionBody}
      >
        <Grid item xs={6}>
          <InfoItem name="Nom" value={bulletinControle.lastName} />
        </Grid>
        <Grid item xs={6}>
          <InfoItem name="Prénom" value={bulletinControle.firstName} />
        </Grid>
        <Grid item xs={6}>
          <InfoItem
            name="Date de naissance"
            value={bulletinControle.birthDate}
          />
        </Grid>
        <Grid item xs={6}>
          <InfoItem name="Nationalité" value={bulletinControle.nationality} />
        </Grid>
      </Grid>
      <Typography variant="h5">Mission lors du contrôle</Typography>
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
                {bulletinControle.vehicleRegistrationNumber || "Non renseigné"}
              </Typography>
            </ListItem>
            <ListItem disableGutters>
              <ListItemIcon>
                <BusinessIcon />
              </ListItemIcon>
              <Typography noWrap align="left" className={classes.fieldValue}>
                {bulletinControle.companyName || "Non renseigné"}
              </Typography>
            </ListItem>
          </List>
        </Grid>
      </Grid>
    </Grid>
  ) : (
    <Typography>
      Renseignez les informations relatives au salarié et à l'entreprise
      directement en éditant le bulletin de contrôle.
    </Typography>
  );
}
