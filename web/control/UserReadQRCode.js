import React from "react";
import Typography from "@mui/material/Typography";
import QRCode from "qrcode.react";
import CircularProgress from "@mui/material/CircularProgress";
import { useApi } from "common/utils/api";
import { formatApiError } from "common/utils/errors";
import { makeStyles } from "@mui/styles";
import { now } from "common/utils/time";
import { HTTP_QUERIES } from "common/utils/apiQueries";
import Notice from "../common/Notice";
import Modal from "../common/Modal";
import Box from "@mui/material/Box";

const useStyles = makeStyles(theme => ({
  container: {
    display: "flex",
    flexShrink: 0,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "start"
  },
  qrCodeText: {
    alignSelf: "flex-start",
    paddingBottom: theme.spacing(6)
  }
}));

export default function UserReadQRCodeModal({ open, handleClose }) {
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
      const json = await api.jsonHttpQuery(HTTP_QUERIES.generateUserReadToken);
      const token = json.token;
      const controlToken = json.controlToken;
      setLink(
        `${
          window.location.origin
        }/control/user-history?token=${token}&ts=${now()}&controlToken=${controlToken}`
      );
    } catch (err) {
      setError(formatApiError(err));
    }
  }

  React.useEffect(() => {
    if (open) getReadLink();
  }, [open]);

  const classes = useStyles();

  return (
    <Modal
      title="Donner accès à votre historique"
      fullHeight
      open={open}
      handleClose={handleClose}
      content={
        <Box className={classes.container}>
          {link ? (
            <>
              <Typography align="left" className={classes.qrCodeText}>
                En cas de contrôle par des personnes habilitées vous pouvez leur
                montrer ce QR code qui leur permettra de consulter les données
                de votre historique.
              </Typography>
              <QRCode value={link} size={180} includeMargin={true} />
            </>
          ) : error ? (
            <Notice
              type="error"
              description="La génération du code d'accès a échoué."
            />
          ) : (
            <CircularProgress color="primary" />
          )}
        </Box>
      }
    />
  );
}
