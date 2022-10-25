import React from "react";
import Stack from "@mui/material/Stack";
import { makeStyles } from "@mui/styles";
import classNames from "classnames";

const useStyles = makeStyles(theme => ({
  card: {
    padding: theme.spacing(3)
  },
  icon: {
    color: theme.palette.primary.main
  }
}));

export function ControllerHelpCard({ iconName, title, description, linkTo }) {
  const classes = useStyles();
  return (
    <a href={linkTo} target="_blank" rel="noreferrer">
      <div className={classNames("fr-tile", classes.card)}>
        <Stack direction="row" spacing={4}>
          <span
            className={classNames(iconName, "fr-icon--lg", classes.icon)}
            aria-hidden="true"
          ></span>
          <Stack>
            <h5>{title}</h5>
            <p>{description}</p>
          </Stack>
        </Stack>
      </div>
    </a>
  );
}
