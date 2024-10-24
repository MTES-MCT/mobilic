import React from "react";
import { makeStyles } from "@mui/styles";
import { Card } from "@mui/material";
import { LinkButton } from "../../../common/LinkButton";
import ButtonBase from "@mui/material/ButtonBase";
import classNames from "classnames";

const useStyles = makeStyles(theme => ({
  button: {
    textAlign: "left"
  },
  linkWholeCard: {
    padding: 0,
    textTransform: "none",
    width: "100%"
  },
  card: {
    width: "100%",
    borderRadius: 10,
    padding: theme.spacing(2),
    borderColor: theme.palette.primary.main
  },
  actionIcon: {
    marginRight: theme.spacing(2),
    verticalAlign: "middle"
  },
  arrowIcon: {
    verticalAlign: "middle",
    float: "right",
    color: theme.palette.primary.main
  }
}));

export function ControllerHomeCard({ text, icon, link, onClick }) {
  const classes = useStyles();

  let buttonActionProps = { onClick };
  let ButtonComponent = ButtonBase;
  if (link) {
    buttonActionProps = { to: link };
    ButtonComponent = LinkButton;
  }

  return (
    <ButtonComponent
      className={`${classes.linkWholeCard} ${!link ? classes.button : ""}`}
      priority="tertiary no outline"
      {...buttonActionProps}
    >
      <Card variant="outlined" className={classes.card}>
        <span className="fr-text--lg">
          <span
            className={classNames(icon, classes.actionIcon)}
            aria-hidden="true"
          ></span>
          {text}
          <span
            className={classNames(
              "fr-icon-arrow-right-s-line",
              "fr-icon--lg",
              classes.arrowIcon
            )}
            aria-hidden="true"
          ></span>
        </span>
      </Card>
    </ButtonComponent>
  );
}
