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
  },
  clickable: {
    cursor: "pointer"
  }
}));

export function ControllerHelpCard({
  iconName,
  title,
  description,
  linkTo,
  clickAction
}) {
  const classes = useStyles();

  const handleClick = () => {
    if (clickAction) {
      clickAction();
    }
  };

  const child = (
    <Stack direction="row" spacing={4}>
      <span
        className={classNames(iconName, "fr-icon--lg", classes.icon)}
        aria-hidden="true"
      ></span>
      <Stack width="100%">
        <h5>{title}</h5>
        <p>{description}</p>
      </Stack>
    </Stack>
  );

  if (linkTo) {
    return (
      <a href={linkTo} target="_blank" rel="noreferrer">
        <div className={classNames("fr-tile", classes.card)}>{child}</div>
      </a>
    );
  }

  return (
    <div
      role="button"
      onClick={handleClick}
      className={classNames("fr-tile", classes.card, classes.clickable)}
    >
      {child}
    </div>
  );
}
