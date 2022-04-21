import React from "react";
import Container from "@mui/material/Container";
import { makeStyles } from "@mui/styles";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

const useStyles = makeStyles(theme => ({
  container: {
    [theme.breakpoints.down("lg")]: {
      padding: 0
    },
    [theme.breakpoints.up("md")]: {
      padding: theme.spacing(4)
    },
    display: "flex",
    flexDirection: "column",
    margin: "auto",
    flexGrow: 1
  },
  title: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    textAlign: "center"
  },
  paper: {
    [theme.breakpoints.down("lg")]: {
      border: "none",
      borderRadius: 0
    },
    flexGrow: 1
  }
}));

export function PaperContainer(props) {
  const classes = useStyles();
  const { children, ...other } = props;
  return (
    <Container
      className={`${classes.container} ${props.className || ""}`}
      {...other}
      maxWidth="md"
      disableGutters
    >
      <Paper className={classes.paper}>{children}</Paper>
    </Container>
  );
}

export function PaperContainerTitle(props) {
  const classes = useStyles();
  return (
    <Typography
      className={`${classes.title} ${props.className || ""}`}
      variant={props.variant || "h3"}
    >
      {props.children}
    </Typography>
  );
}
