import React from "react";
import { makeStyles } from "@mui/styles";
import { useIsWidthUp } from "common/utils/useWidth";
import { prettyFormatDayHour } from "common/utils/time";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import { ControllerControlExportMenu } from "./ControllerControlExportMenu";
import { Button } from "@codegouvfr/react-dsfr/Button";

const useStyles = makeStyles(theme => ({
  desktopHeaderContainer: {
    paddingBottom: theme.spacing(1)
  },
  linkHomeDesktopLine: {
    textAlign: "right",
    width: "100%"
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
  },
  underlinedButton: {
    textDecoration: "underline"
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
        <Button
          onClick={onCloseDrawer}
          priority="secondary"
          iconPosition="right"
          iconId="fr-icon-close-line"
          size="small"
        >
          Fermer
        </Button>
      </Box>
      <Typography variant="h3" component="h1">
        Contrôle #{controlId}
      </Typography>
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
        <Button
          onClick={onCloseDrawer}
          priority="tertiary no outline"
          iconId="fr-icon-arrow-left-s-line"
          iconPosition="left"
          className={classes.underlinedButton}
        >
          Fermer
        </Button>
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
