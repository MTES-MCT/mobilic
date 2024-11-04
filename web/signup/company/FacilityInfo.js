import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import React from "react";
import { makeStyles } from "@mui/styles";
import CardContent from "@mui/material/CardContent";

const useStyles = makeStyles(theme => ({
  facilityName: {
    textTransform: "uppercase"
  },
  facilitySiret: {
    fontStyle: "italic",
    fontSize: "80%",
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1)
  },
  facilityPostalCode: {
    fontWeight: "normal"
  },
  errorText: {
    color: theme.palette.error.main,
    textTransform: "none",
    marginTop: theme.spacing(3),
    fontWeight: "bold"
  }
}));

export function FacilityInfo({ facility, alreadyRegistered }) {
  const classes = useStyles();

  return (
    <Card
      style={{ textAlign: "left" }}
      variant="outlined"
      sx={{ width: "100%" }}
    >
      <CardContent>
        <Typography variant="h5" gutterBottom>
          {facility.address}, {facility.postal_code}
        </Typography>
        <Typography
          gutterBottom
          variant="body2"
          className={classes.facilityName}
        >
          Nom : {facility.name}
        </Typography>
        <Typography variant="body2" className={classes.facilitySiret}>
          SIRET : {facility.siret}
        </Typography>
        <Typography variant="body2" className={classes.facilitySiret}>
          Code NAF : {facility.activity}
        </Typography>
        {alreadyRegistered && (
          <Typography className={classes.errorText}>
            Etablissement déjà inscrit
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
