import React from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import Typography from "@material-ui/core/Typography";
import QRCode from "qrcode.react";
import CircularProgress from "@material-ui/core/CircularProgress";
import { CustomDialogTitle } from "../common/CustomDialogTitle";
import { useApi } from "common/utils/api";
import { formatApiError } from "common/utils/errors";
import makeStyles from "@material-ui/core/styles/makeStyles";

const useStyles = makeStyles(theme => ({
  container: {
    display: "flex",
    flexShrink: 0,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
  },
  qrCodeText: {
    alignSelf: "flex-start",
    paddingBottom: theme.spacing(4)
  }
}));

export function UserReadQRCodeModal({ open, handleClose }) {
  const [link, setLink] = React.useState(null);
  const [error, setError] = React.useState(null);

  const api = useApi();

  React.useEffect(() => {
    if (!open) {
      setLink(null);
      setError(null);
    }
  }, [open]);

  async function getReadLink() {
    try {
      const tokenResponse = await api.httpQuery(
        "POST",
        "/control/generate-user-read-token"
      );
      const json = await tokenResponse.json();
      const token = json.token;
      setLink(window.location.origin + "/control/user-history/" + token);
    } catch (err) {
      setError(formatApiError(err));
    }
  }

  React.useEffect(() => {
    if (open) getReadLink();
  }, [open]);

  const classes = useStyles();

  return (
    <Dialog
      onClose={handleClose}
      open={open}
      scroll="paper"
      PaperProps={{ style: { height: "100%" } }}
    >
      <CustomDialogTitle
        title={"Accès à l'historique"}
        handleClose={handleClose}
      />
      <DialogContent className={classes.container}>
        {link ? (
          [
            <Typography align="left" className={classes.qrCodeText} key={0}>
              Vous pouvez consulter l'historique depuis un autre téléphone en
              scannant le QR code suivant, à condition d'avoir un accès
              Internet.
            </Typography>,
            <QRCode value={link} size={180} key={1} />
          ]
        ) : error ? (
          <Typography color="error">
            La génération du code d'accès a échoué.
          </Typography>
        ) : (
          <CircularProgress color="primary" />
        )}
      </DialogContent>
    </Dialog>
  );
}
