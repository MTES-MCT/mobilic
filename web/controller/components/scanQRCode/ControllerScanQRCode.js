import React from "react";
import { makeStyles } from "@mui/styles";
import { QrReader } from "react-qr-reader";
import Grid from "@mui/material/Grid";
import useTheme from "@mui/styles/useTheme";
import { useHistory } from "react-router-dom";
import { CONTROLLER_ROUTE_PREFIX } from "../../../common/routes";
import { CONTROLLER_SCAN_CODE } from "common/utils/apiQueries";
import { useApi } from "common/utils/api";
import { useSnackbarAlerts } from "../../../common/Snackbar";
import { prettyFormatDayHour } from "common/utils/time";
import { useLoadingScreen } from "common/utils/loading";
import Typography from "@mui/material/Typography";
import { Header } from "../../../common/Header";
import { CONTROL_TYPES } from "../../utils/useReadControlData";
import { usePageTitle } from "../../../common/UsePageTitle";
import Notice from "../../../common/Notice";
import { Main } from "../../../common/semantics/Main";
import { ControllerBackButton } from "./ControllerBackButton";

const useStyles = makeStyles(theme => ({
  container: {
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(7),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    margin: 0,
    textAlign: "left"
  },
  titleScan: {
    textAlign: "center",
    marginTop: theme.spacing(3)
  },
  whiteSection: {
    backgroundColor: theme.palette.background.paper
  },
  noQRCodeLink: {
    marginTop: theme.spacing(2)
  },
  qrCodeScan: {
    width: "100%"
  },
  videoContainerStyle: {
    borderRadius: theme.spacing(3)
  },
  cameraGridContainer: {
    paddingRight: theme.spacing(3),
    paddingLeft: theme.spacing(3),
    marginTop: theme.spacing(2)
  }
}));
export function ControllerScanQRCode() {
  usePageTitle("Scan QRCode - Mobilic");
  const classes = useStyles();
  const api = useApi();
  const theme = useTheme();
  const history = useHistory();
  const alerts = useSnackbarAlerts();
  const withLoadingScreen = useLoadingScreen();

  const displayCameraDeniedAlert = () => {
    alerts.error(
      "L'autorisation d'utiliser la caméra a été refusée. Pour l'activer, allez dans les paramètres de votre navigateur.",
      {},
      6000
    );
  };

  const managePermissionState = state => {
    if (state === "denied") {
      displayCameraDeniedAlert();
    }
  };

  const isPermissionDeniedOnSafari = error => error?.name === "NotAllowedError";

  React.useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions.query({ name: "camera" }).then(res => {
        managePermissionState(res.state);
        res.onchange = () => {
          managePermissionState(res.state);
        };
      });
    }
  }, []);

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
            controlResponse.qrCodeGenerationTime
          )} a été enregistré avec succès.`,
          "0",
          6000
        );
        history.push(CONTROLLER_ROUTE_PREFIX + "/home", {
          controlOnFocus: {
            id: controlResponse.id,
            type: CONTROL_TYPES.MOBILIC.label
          }
        });
      } catch (err) {
        history.push(CONTROLLER_ROUTE_PREFIX + "/scan_error");
      }
    });
  };

  const controlHistoryDepth =
    process.env.REACT_APP_USER_CONTROL_HISTORY_DEPTH || 28;

  return (
    <>
      <Header />
      <Main
        className={`${classes.container} ${classes.whiteSection}`}
        maxWidth="xl"
      >
        <ControllerBackButton label="Accueil" route="/home" />
        <h3 className={classes.titleScan}>Scannez un QR Code Mobilic</h3>
        <Typography>
          Afin d'accéder à l'historique de {controlHistoryDepth} jours du
          salarié, positionnez son QR Code dans le cadre.
        </Typography>
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
                    if (isPermissionDeniedOnSafari(error)) {
                      displayCameraDeniedAlert();
                    }
                    console.info(error);
                  }
                }}
                className={classes.qrCodeScan}
              />
            </div>
          </Grid>
        </Grid>
        <Notice
          sx={{ marginTop: 3 }}
          description={
            <>
              Plusieurs personnes sont à bord du VUL ? Scannez un premier QR
              Code (ex : conducteur) puis procédez à un nouveau contrôle (ex :
              accompagnateur)
            </>
          }
        />
        <div className={classes.noQRCodeLink}>
          <a
            className="fr-link fr-link--icon-right fr-fi-external-link-line"
            target="_blank"
            href="https://faq.mobilic.beta.gouv.fr/securite-et-confidentialite-des-donnees/modalites-de-controle"
            rel="noopener noreferrer"
          >
            Le salarié ne trouve pas son QR Code ?
          </a>
        </div>
      </Main>
    </>
  );
}
