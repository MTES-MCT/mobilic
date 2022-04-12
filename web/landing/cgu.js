import React from "react";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Typography from "@mui/material/Typography";
import { LoadingButton } from "common/components/LoadingButton";
import ReactMarkdown from "react-markdown";
import CircularProgress from "@mui/material/CircularProgress";
import { makeStyles } from "@mui/styles";
import { useIsWidthDown } from "common/utils/useWidth";
import Button from "@mui/material/Button";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import { CustomDialogActions } from "../common/CustomDialogTitle";
import Box from "@mui/material/Box";
import { Header } from "../common/Header";
import Container from "@mui/material/Container";
import { PaperContainer, PaperContainerTitle } from "../common/PaperContainer";

const useStyles = makeStyles(theme => ({
  p: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1)
  }
}));

export function CGU() {
  return [
    <Header key={0} />,
    <PaperContainer key={1}>
      <PaperContainerTitle>
        Conditions générales d'utilisation
      </PaperContainerTitle>
      <Container
        maxWidth="false"
        style={{ textAlign: "justify", paddingBottom: 16 }}
      >
        <CGUContent />
      </Container>
    </PaperContainer>
  ];
}

function CGUContent() {
  const [md, setMd] = React.useState(null);

  const classes = useStyles();

  async function loadCGU() {
    const cguFile = await fetch("/cgu.md");
    setMd(await cguFile.text());
  }

  React.useEffect(() => {
    if (!md) loadCGU();
  }, []);

  return md ? (
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
    <Box className="flex-row-center">
      <CircularProgress color="primary" />
    </Box>
  );
}

function CGUModal({ open, handleClose, handleAccept, handleReject, width }) {
  const store = useStoreSyncedWithLocalStorage();
  const isSmDown = useIsWidthDown("sm");

  return (
    <Dialog
      onClose={handleClose}
      open={open}
      scroll="paper"
      fullWidth
      fullScreen={isSmDown}
      maxWidth="md"
      PaperProps={{ style: { height: "100%" } }}
    >
      <DialogTitle disableTypography>
        <Typography variant="h4">Conditions générales d'utilisation</Typography>
      </DialogTitle>
      <DialogContent dividers>
        <CGUContent />
      </DialogContent>
      <CustomDialogActions>
        {handleAccept && (
          <LoadingButton
            aria-label="Accepter"
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
            aria-label="Refuser"
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
          <Button
            aria-label="Fermer"
            variant="outlined"
            color="primary"
            onClick={handleClose}
          >
            Fermer
          </Button>
        )}
      </CustomDialogActions>
    </Dialog>
  );
}

export default CGUModal;
