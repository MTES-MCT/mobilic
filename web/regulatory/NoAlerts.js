import React from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles((theme) => ({
  card: {
    backgroundColor: "white",
    padding: theme.spacing(2)
  }
}));

export function NoAlerts() {
  const classes = useStyles();
  return (
    <Stack direction="row" className={classes.card} columnGap={1} mt={1}>
      <span className={"fr-icon-success-line"} style={{ color: "#18753C" }} />
      <Typography fontWeight={500}>
        Tous les seuils réglementaires ont été respectés !
      </Typography>
    </Stack>
  );
}
