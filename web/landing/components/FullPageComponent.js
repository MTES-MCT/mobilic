import React from "react";
import { Header } from "../../common/Header";
import { Main } from "../../common/semantics/Main";
import { Footer } from "../footer";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles(theme => ({
  container: {
    padding: theme.spacing(4),
    paddingBottom: theme.spacing(7),
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(2),
      paddingBottom: theme.spacing(2)
    },
    margin: "auto",
    textAlign: "left"
  }
}));

export const FullPageComponent = ({ children }) => {
  const classes = useStyles();
  return (
    <>
      <Header />
      <Main className={classes.container}>{children}</Main>
      <Footer />
    </>
  );
};
