import React from "react";
import Box from "@mui/material/Box";
import { makeStyles } from "@mui/styles";
import { ControllerControlNoLicInformationsNotes as Notes } from "./ControllerControlNoLicInformationsNotes";
import { ControllerControlNoLicInformationsInfos as Infos } from "./ControllerControlNoLicInformationsInfos";

const useStyles = makeStyles(theme => ({
  container: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2)
  }
}));
export function ControllerControlNoLicInformations({ notes, setNotes }) {
  const classes = useStyles();
  return (
    <Box className={classes.container}>
      <Notes notes={notes} setNotes={setNotes} />
      <Infos />
    </Box>
  );
}
