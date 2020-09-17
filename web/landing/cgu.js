import React from "react";
import DialogTitle from "@material-ui/core/DialogTitle";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import Typography from "@material-ui/core/Typography";
import { LoadingButton } from "common/components/LoadingButton";
import ReactMarkdown from "react-markdown";
import CircularProgress from "@material-ui/core/CircularProgress";
import makeStyles from "@material-ui/core/styles/makeStyles";
import withWidth, { isWidthDown } from "@material-ui/core/withWidth";
import Button from "@material-ui/core/Button";
import { useStoreSyncedWithLocalStorage } from "common/utils/store";

const useStyles = makeStyles(theme => ({
  p: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1)
  }
}));

function _CGUModal({ open, handleClose, handleAccept, handleReject, width }) {
  const [md, setMd] = React.useState(null);

  const store = useStoreSyncedWithLocalStorage();

  async function loadCGU() {
    const cguFile = await fetch("/cgu.md");
    setMd(await cguFile.text());
  }

  React.useEffect(() => {
    loadCGU();
  }, []);

  const classes = useStyles();

  return (
    <Dialog
      onClose={handleClose}
      open={open}
      scroll="paper"
      fullWidth
      fullScreen={isWidthDown("xs", width)}
      maxWidth="md"
    >
      <DialogTitle disableTypography>
        <Typography variant="h4">Conditions générales d'utilisation</Typography>
      </DialogTitle>
      <DialogContent dividers>
        {md ? (
          <ReactMarkdown
            source={md}
            renderers={{
              paragraph: props => (
                <Typography className={classes.p} variant="body1" {...props} />
              ),
              listItem: props => (
                <Typography
                  component="li"
                  className={classes.p}
                  variant="body1"
                  {...props}
                />
              )
            }}
          />
        ) : (
          <CircularProgress color="primary" />
        )}
      </DialogContent>
      <DialogActions>
        {handleAccept && (
          <LoadingButton
            variant="contained"
            color="primary"
            onClick={async () => {
              await handleAccept();
              await store.setHasAcceptedCgu();
              handleClose();
            }}
          >
            Accepter
          </LoadingButton>
        )}
        {handleAccept && (
          <LoadingButton
            variant="outlined"
            color="primary"
            onClick={async () => {
              if (handleReject) await handleReject();
              handleClose();
            }}
          >
            Refuser
          </LoadingButton>
        )}
        {!handleAccept && (
          <Button variant="outlined" color="primary" onClick={handleClose}>
            Fermer
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export const CGUModal = withWidth()(_CGUModal);
