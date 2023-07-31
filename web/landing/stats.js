import React from "react";
import Container from "@mui/material/Container";
import { Header } from "../common/Header";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles(theme => ({
  container: {
    padding: theme.spacing(4),
    paddingBottom: theme.spacing(1),
    margin: "auto",
    height: "100%"
  }
}));

export default function Stats() {
  const classes = useStyles();

  return [
    <Header key={1} />,
    <Container key={2} className={classes.container} maxWidth={false}>
      <iframe
        title="Métriques publiques"
        src="https://metabase.mobilic.beta.gouv.fr/public/dashboard/1d41b5c1-8eed-4688-a605-306614511814#bordered=false"
        width="100%"
        height="100%"
        style={{ backgroundColor: "transparent" }}
      ></iframe>
    </Container>
  ];
}
