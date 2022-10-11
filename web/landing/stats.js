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
        src="https://metabase.mobilic.beta.gouv.fr/public/dashboard/14cc44a1-eec6-4d8d-9269-b67b10ca77bc#bordered=false"
        frameBorder="0"
        width="100%"
        height="100%"
        style={{ backgroundColor: "transparent" }}
      ></iframe>
    </Container>
  ];
}
