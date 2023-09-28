import React from "react";
import { makeStyles } from "@mui/styles";
import { useIsWidthUp } from "common/utils/useWidth";
import { prettyFormatDayHour } from "common/utils/time";
import classNames from "classnames";
import { Link } from "react-router-dom";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import { ControllerControlExportMenu } from "./ControllerControlExportMenu";

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
  subHeaderSection: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingLeft: "none",
    paddingRight: "none",
    paddingBottom: theme.spacing(1),
    [theme.breakpoints.up("md")]: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
      paddingBottom: "none"
    },
    mobileHeaderContainer: {
      marginBottom: theme.spacing(2)
    }
  }
}));

export function ControllerControlHeader({
  controlId,
  controlDate,
  onCloseDrawer,
  canDownloadXml,
  enableExport = true
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
          Fermer
        </Typography>
      </Box>
      <h5>Contrôle #{controlId}</h5>
      <Box className={classes.subHeaderSection}>
        <Typography>
          Date et heure du contrôle : <b>{prettyFormatDayHour(controlDate)}</b>
        </Typography>
        {enableExport && (
          <ControllerControlExportMenu
            controlId={controlId}
            canDownloadXml={canDownloadXml}
          />
        )}
      </Box>
    </Container>
  ) : (
    <Container className={classes.mobileHeaderContainer}>
      <Box className={classes.subHeaderSection}>
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
          Fermer
        </Link>
        {enableExport && (
          <ControllerControlExportMenu
            controlId={controlId}
            canDownloadXml={canDownloadXml}
          />
        )}
      </Box>
    </Container>
  );
}
