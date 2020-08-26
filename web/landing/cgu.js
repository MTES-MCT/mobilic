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

const useStyles = makeStyles(theme => ({
  p: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1)
  }
}));

export function CGUModal({ open, handleClose, handleAccept, handleReject }) {
  const [md, setMd] = React.useState(null);
  const [disabledAccept, setDisabledAccept] = React.useState(true);

  async function loadCGU() {
    const cguFile = await fetch("/cgu.md");
    setMd(await cguFile.text());
  }

  React.useEffect(() => {
    loadCGU();
  }, []);

  React.useEffect(() => {
    setDisabledAccept(true);
  }, [open]);

  const classes = useStyles();

  return (
    <Dialog
      onClose={handleClose}
      open={open}
      scroll="paper"
      fullWidth
      maxWidth="md"
    >
      <DialogTitle disableTypography>
        <Typography variant="h4">Conditions générales d'utilisation</Typography>
      </DialogTitle>
      <DialogContent
        dividers
        onScroll={event => {
          const bottom =
            event.target.scrollHeight - event.target.scrollTop ===
            event.target.clientHeight;
          if (bottom) {
            setDisabledAccept(false);
          }
        }}
      >
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
        <LoadingButton
          variant="contained"
          color="primary"
          onClick={async () => {
            await handleAccept();
            handleClose();
          }}
          disabled={disabledAccept}
        >
          Accepter
        </LoadingButton>
        <LoadingButton
          variant="outlined"
          color="primary"
          onClick={async () => {
            await handleReject();
            handleClose();
          }}
        >
          Refuser
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
