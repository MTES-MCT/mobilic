import React from "react";
import { makeStyles } from "@mui/styles";
import { useIsWidthUp } from "common/utils/useWidth";
import { prettyFormatDayHour } from "common/utils/time";
import classNames from "classnames";
import Link from "react-router-dom/es/Link";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";

const useStyles = makeStyles(theme => ({
  desktopHeaderContainer: {
    paddingBottom: theme.spacing(1)
  },
  linkHomeDesktopLine: {
    textAlign: "right",
    width: "100%"
  },
  linkHomeDesktop: {
    cursor: "pointer"
  },
  mobileHeaderContainer: {
    marginBottom: theme.spacing(2)
  }
}));

export function ControllerControlHeader({
  controlId,
  controlDate,
  onCloseDrawer
}) {
  const classes = useStyles();
  const isOnDesktop = useIsWidthUp("md");
  return isOnDesktop ? (
    <Container className={classes.desktopHeaderContainer}>
      <Box className={classes.linkHomeDesktopLine}>
        <Typography
          className={classNames(
            classes.linkHomeDesktop,
            "fr-link",
            "fr-fi-close-line",
            "fr-link--icon-right"
          )}
          onClick={onCloseDrawer}
        >
          Accueil
        </Typography>
      </Box>
      <h5>Contrôle #{controlId}</h5>
      <Typography>
        Date et heure du contrôle : <b>{prettyFormatDayHour(controlDate)}</b>
      </Typography>
    </Container>
  ) : (
    <Container className={classes.mobileHeaderContainer}>
      <Link
        to="#"
        className={classNames(
          classes.linkHomeMobile,
          "fr-link",
          "fr-fi-arrow-left-line",
          "fr-link--icon-left"
        )}
        onClick={onCloseDrawer}
      >
        Accueil
      </Link>
    </Container>
  );
}
