import React from "react";
import { makeStyles } from "@mui/styles";
import Container from "@mui/material/Container";
import { Header } from "../../../common/Header";
import { ControllerHistoryFilters } from "./Filters";

const useStyles = makeStyles(theme => ({
  container: {
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(7),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    margin: 0,
    textAlign: "center"
  },
  whiteSection: {
    backgroundColor: theme.palette.background.paper
  }
}));

export function ControllerHistory() {
  const classes = useStyles();
  return [
    <Header key={0} />,
    <Container
      key={1}
      className={`${classes.container} ${classes.whiteSection}`}
      maxWidth="xl"
    >
      <h1>Historique des contrôles</h1>
      <div>
        <ControllerHistoryFilters />
      </div>
      <div>Controles</div>
    </Container>
  ];
}
