import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import RadioGroup from "@mui/material/RadioGroup";
import Grid from "@mui/material/Grid";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import TextField from "@mui/material/TextField";
import React from "react";
import { makeStyles } from "@mui/styles";

export const WAY_HEARD_OF_MOBILIC_CHOICES = [
  {
    value: "MAIL_MOBILIC",
    label: "Courriel de l'équipe Mobilic"
  },
  {
    value: "MAIL_DREAL",
    label: "Courrier/courriel de la DREAL"
  },
  {
    value: "DURING_CONTROL",
    label: "Lors d'un contrôle"
  },
  {
    value: "SOCIAL_NETWORK",
    label: "Sur les réseaux sociaux"
  },
  {
    value: "WEBINAR",
    label: "Lors d’un webinaire organisé par l’équipe Mobilic"
  },
  {
    value: "WORD_OF_MOUTH",
    label: "Bouche à oreille"
  }
];

export const HEARD_OF_MOBILIC_OTHER_VALUE = "OTHER";

const useStyles = makeStyles(theme => ({
  wayKnowingMobilicSection: {
    textAlign: "left",
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    color: theme.palette.grey[700]
  },
  wayKnowingMobilicTitle: {
    marginBottom: theme.spacing(1)
  }
}));

export const WayHeardOfMobilic = ({ setWayHeardOfMobilicValue }) => {
  const classes = useStyles();
  const [wayHeardOfMobilicSelect, setWayHeardOfMobilicSelect] = React.useState(
    ""
  );

  const handleChangeWayHeardOfMobilic = event => {
    setWayHeardOfMobilicSelect(event.target.value);
    setWayHeardOfMobilicValue(event.target.value);
  };

  return (
    <Box className={classes.wayKnowingMobilicSection}>
      <Typography className={classes.wayKnowingMobilicTitle}>
        Comment avez-vous connu Mobilic ?
      </Typography>
      <RadioGroup
        aria-label="how-did-you-know-mobilic"
        name="controlled-radio-buttons-group"
        value={wayHeardOfMobilicSelect}
        onChange={handleChangeWayHeardOfMobilic}
      >
        <Grid container>
          {WAY_HEARD_OF_MOBILIC_CHOICES.map(choice => (
            <Grid item xs={12} sm={6} key={choice.value}>
              <FormControlLabel
                value={choice.value}
                control={<Radio size={"small"} />}
                label={choice.label}
              />
            </Grid>
          ))}
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              key={HEARD_OF_MOBILIC_OTHER_VALUE}
              control={
                <Radio
                  size={"small"}
                  value={HEARD_OF_MOBILIC_OTHER_VALUE}
                  color="primary"
                  label="Autre"
                />
              }
              label={
                wayHeardOfMobilicSelect === HEARD_OF_MOBILIC_OTHER_VALUE ? (
                  <TextField
                    label="Précisez"
                    variant="standard"
                    inputProps={{
                      maxLength: 250
                    }}
                    onChange={e => {
                      setWayHeardOfMobilicValue(e.target.value.trimLeft());
                    }}
                  />
                ) : (
                  "Autre"
                )
              }
            />
          </Grid>
        </Grid>
      </RadioGroup>
    </Box>
  );
};
