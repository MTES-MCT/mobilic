import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card/Card";
import React from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import CardContent from "@material-ui/core/CardContent";

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
  selectedFacility: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText
  },
  errorText: {
    color: theme.palette.error.main,
    textTransform: "none",
    marginTop: theme.spacing(3),
    fontWeight: "bold"
  }
}));

export function FacilityInfo({ facility, selected, alreadyRegistered }) {
  const classes = useStyles();

  return (
    <Card
      raised
      style={{ textAlign: "left" }}
      className={selected && classes.selectedFacility}
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
