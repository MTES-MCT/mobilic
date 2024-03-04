import React from "react";
import classNames from "classnames";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles(theme => ({
  container: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    alignContent: "center",
    justifyContent: "center",
    alignItems: "stretch",
    gap: "16px",
    textAlign: "left"
  }
}));

export function RoleSelection({ title, children }) {
  const classes = useStyles();
  return (
    <>
      <h4 className="fr-pt-2w">{title}</h4>
      <div className={classNames(classes.container, "fr-mx-2w")}>
        {children}
      </div>
    </>
  );
}
