import React from "react";
import { makeStyles } from "@mui/styles";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Switch from "@mui/material/Switch";

const useStyles = makeStyles(theme => ({
  switchContainer: {
    display: "flex",
    alignItems: "center"
  }
}));

export default function SignFilesCheckbox({ sign, setSign }) {
  const classes = useStyles();
  return (
    <Box className={classes.switchContainer}>
      <Switch
        color="secondary"
        checked={sign}
        onChange={e => setSign(e.target.checked)}
      />
      <Typography style={sign ? {} : { opacity: 0.3 }}>
        Ajouter des signatures numériques aux fichiers pour prouver leur
        intégrité
      </Typography>
    </Box>
  );
}
