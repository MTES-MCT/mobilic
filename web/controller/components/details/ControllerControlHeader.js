import React from "react";
import { makeStyles } from "@mui/styles";
import { useIsWidthUp } from "common/utils/useWidth";
import { prettyFormatDayHour } from "common/utils/time";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import { ControllerControlExportMenu } from "./ControllerControlExportMenu";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useControl } from "../../utils/contextControl";
import { ControllerControlBackButton } from "../utils/ControllerControlBackButton";
import { Stack } from "@mui/material";

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
    alignItems: "end",
    paddingLeft: "none",
    paddingRight: "none",
    paddingBottom: theme.spacing(1),
    mobileHeaderContainer: {
      marginBottom: theme.spacing(2)
    }
  }
}));

export function ControllerControlHeader({ controlDate, onCloseDrawer }) {
  const classes = useStyles();
  const { controlId, updateControlTime } = useControl();
  const isOnDesktop = useIsWidthUp("md");
  return isOnDesktop ? (
    <Container className={classes.desktopHeaderContainer} id="control-header">
      <Box className={classes.linkHomeDesktopLine}>
        <Button
          onClick={onCloseDrawer}
          priority="tertiary"
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
        <Stack direction="row" alignItems="center" columnGap={2}>
          <Typography>
            Date et heure du contrôle :{" "}
            <b>{prettyFormatDayHour(controlDate)}</b>
          </Typography>
          <Button size="small" priority="tertiary" onClick={updateControlTime}>
            Modifier
          </Button>
        </Stack>
        <ControllerControlExportMenu />
      </Box>
    </Container>
  ) : (
    <Container className={classes.mobileHeaderContainer} id="control-header">
      <Box className={classes.subHeaderSection}>
        <ControllerControlBackButton onClick={onCloseDrawer}>
          Fermer
        </ControllerControlBackButton>
        <ControllerControlExportMenu />
      </Box>
    </Container>
  );
}
