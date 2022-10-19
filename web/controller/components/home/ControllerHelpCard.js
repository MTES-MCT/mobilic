import React from "react";
import Stack from "@mui/material/Stack";
import { makeStyles } from "@mui/styles";
import classNames from "classnames";

const useStyles = makeStyles(theme => ({
  card: {
    padding: theme.spacing(3)
  }
}));

export function ControllerHelpCard({
  iconComponent,
  title,
  description,
  linkTo
}) {
  const classes = useStyles();
  return (
    <a href={linkTo} target="_blank" rel="noreferrer">
      <div className={classNames("fr-tile", classes.card)}>
        <Stack direction="row" spacing={4}>
          {iconComponent}
          <Stack>
            <h5>{title}</h5>
            <p>{description}</p>
          </Stack>
        </Stack>
      </div>
    </a>
  );
}
