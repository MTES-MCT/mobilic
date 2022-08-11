import React from "react";
import { ControllerHeader } from "../header/ControllerHeader";
import { makeStyles } from "@mui/styles";
import Container from "@mui/material/Container";
import classNames from "classnames";
import { Alert } from "@mui/material";
import { QrReader } from "react-qr-reader";
import Grid from "@mui/material/Grid";
import useTheme from "@mui/styles/useTheme";
import Link from "react-router-dom/es/Link";
import { CONTROLLER_ROUTE_PREFIX } from "../../../common/routes";
import { CONTROLLER_SCAN_CODE } from "common/utils/apiQueries";
import { useApi } from "common/utils/api";
import { formatApiError } from "common/utils/errors";
import { useSnackbarAlerts } from "../../../common/Snackbar";
import { prettyFormatDayHour } from "common/utils/time";
import { useHistory } from "react-router-dom";
import { useLoadingScreen } from "common/utils/loading";

const useStyles = makeStyles(theme => ({
  container: {
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(7),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    margin: 0,
    textAlign: "left"
  },
  linkHome: {
    textAlign: "left"
  },
  titleScan: {
    textAlign: "center",
    marginTop: theme.spacing(2)
  },
  whiteSection: {
    backgroundColor: theme.palette.background.paper
  },
  noQRCodeLink: {
    marginTop: theme.spacing(4)
  },
  qrCodeScan: {
    width: "100%"
  },
  videoContainerStyle: {
    borderRadius: theme.spacing(3)
  },
  cameraGridContainer: {
    marginTop: theme.spacing(6)
  },
  scanSeveralCodes: {
    marginTop: theme.spacing(2)
  }
}));
export function ControllerScanQRCode() {
  const classes = useStyles();
  const api = useApi();
  const theme = useTheme();
  const history = useHistory();
  const alerts = useSnackbarAlerts();
  const withLoadingScreen = useLoadingScreen();

  const getNewTokenFromOldQRCode = scannedCode => {
    if (
      scannedCode.startsWith(`${window.location.origin}/control/user-history`)
    ) {
      const queryString = new URLSearchParams(scannedCode);
      return queryString.get("controlToken");
    } else {
      return scannedCode;
    }
  };

  const onScanQRCode = async scannedCode => {
    withLoadingScreen(async () => {
      try {
        const tokenToSend = getNewTokenFromOldQRCode(scannedCode);
        const apiResponse = await api.graphQlMutate(
          CONTROLLER_SCAN_CODE,
          { jwtToken: tokenToSend },
          { context: { nonPublicApi: true } }
        );
        const controlResponse = apiResponse.data.controllerScanCode;
        alerts.success(
          `Le contrôle ${controlResponse.id} du ${prettyFormatDayHour(
            controlResponse.validFrom
          )} a été enregistré avec succès.`,
          "0",
          6000
        );
        history.push(CONTROLLER_ROUTE_PREFIX + "/home");
      } catch (err) {
        alerts.error(formatApiError(err), scannedCode, 6000);
      }
    });
  };

  return [
    <ControllerHeader key={0} />,
    <Container
      key={20}
      className={`${classes.container} ${classes.whiteSection}`}
      maxWidth="xl"
    >
      <Link
        className={classNames(
          classes.linkHome,
          "fr-link",
          "fr-fi-arrow-left-line",
          "fr-link--icon-left"
        )}
        to={CONTROLLER_ROUTE_PREFIX + "/home"}
      >
        Accueil
      </Link>
      <h3 className={classes.titleScan}>Scannez un QR Code Mobilic</h3>
      <Grid
        container
        justifyContent="center"
        className={classes.cameraGridContainer}
      >
        <Grid item xs={12} md={8} lg={4}>
          <div className={"camera-box"}>
            <QrReader
              constraints={{ facingMode: "environment", aspectRatio: 1 }}
              videoContainerStyle={{
                borderRadius: theme.spacing(2),
                zIndex: -1
              }}
              onResult={(result, error) => {
                if (result && result?.text) {
                  onScanQRCode(result?.text);
                }

                if (error) {
                  console.info(error);
                }
              }}
              className={classes.qrCodeScan}
            />
          </div>
        </Grid>
      </Grid>
      <Alert severity="info" className={classes.scanSeveralCodes}>
        Plusieurs personnes sont à bord du VUL ? Scannez un premier QR code (ex{" "}
        : conducteur) puis procédez à un nouveau contrôle (ex : accompagnateur)
      </Alert>
      <a className={classNames(classes.noQRCodeLink, "fr-link")} href="#">
        Le salarié ne trouve pas son QR code ?
      </a>
    </Container>
  ];
}
