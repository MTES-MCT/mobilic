import React from "react";
import { ControllerHeader } from "../header/ControllerHeader";
import { makeStyles } from "@mui/styles";
import Container from "@mui/material/Container";
import classNames from "classnames";
import { Alert } from "@mui/material";
import { QrReader } from "react-qr-reader";
import Grid from "@mui/material/Grid";
import useTheme from "@mui/styles/useTheme";

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
  }
}));
export function ControllerScanQRCode() {
  const classes = useStyles();
  const theme = useTheme();

  return [
    <ControllerHeader key={0} />,
    <Container
      key={2}
      className={`${classes.container} ${classes.whiteSection}`}
      maxWidth="xl"
    >
      <h3 className={classes.titleScan} key={1}>
        Scannez un QR Code Mobilic
      </h3>
      <Alert severity="info" className={classes.missionTooLongWarning}>
        Plusieurs personnes sont à bord du VUL ? Scannez un premier QR code (ex{" "}
        : conducteur) puis procédez à un nouveau contrôle (ex : accompagnateur)
      </Alert>
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
                if (result) {
                  console.log(result?.text);
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
      <a className={classNames(classes.noQRCodeLink, "fr-link")} href="#">
        Le salarié ne trouve pas son QR code ?
      </a>
    </Container>
  ];
}
