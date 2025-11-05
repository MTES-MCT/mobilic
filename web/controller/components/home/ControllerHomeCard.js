import React from "react";
import { makeStyles } from "@mui/styles";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { LinkButton } from "../../../common/LinkButton";
import ButtonBase from "@mui/material/ButtonBase";
import classNames from "classnames";
import { fr } from "@codegouvfr/react-dsfr";

const useStyles = makeStyles(theme => ({
  button: {
    textAlign: "left"
  },
  linkWholeCard: {
    maxWidth: "420px",
    padding: 0,
    textTransform: "none",
    width: "100%",
    color: "inherit"
  },
  card: {
    width: "100%",
    padding: theme.spacing(2),
    border: "1px solid",
    borderColor: fr.colors.decisions.border.default.grey.default,
    fontWeight: 400
  },
  actionIcon: {
    marginRight: theme.spacing(2),
    verticalAlign: "middle",
    color: fr.colors.decisions.background.flat.blueFrance.default
  },
  arrowIcon: {
    verticalAlign: "middle",
    float: "right",
    color: fr.colors.decisions.background.flat.grey.default
  },
  text: {
    flexGrow: 1
  }
}));

export function ControllerHomeCard({
  text,
  icon,
  link,
  onClick
}) {
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
      <Stack
        direction="row"
        className={classes.card}
        justifyContent="space-between"
        alignItems="center"
      >
        <span
          className={classNames(icon, classes.actionIcon)}
          aria-hidden="true"
        ></span>
        <Typography className={classes.text}>{text}</Typography>
        <span
          className={classNames(
            "fr-icon-arrow-right-s-line",
            classes.arrowIcon
          )}
          aria-hidden="true"
        ></span>
      </Stack>
    </ButtonComponent>
  );
}
