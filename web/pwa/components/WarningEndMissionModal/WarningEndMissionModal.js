import React from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import Typography from "@material-ui/core/Typography";
import {
  CustomDialogActions,
  CustomDialogTitle
} from "../../../common/CustomDialogTitle";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { LoadingButton } from "common/components/LoadingButton";
import { MainCtaButton } from "../MainCtaButton";

const useStyles = makeStyles(theme => ({
  container: {
    display: "flex",
    flexShrink: 0,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
  },
  warningText: {
    alignSelf: "flex-start",
    paddingBottom: theme.spacing(2)
  }
}));

export default function WarningEndMissionModal({
  open,
  handleClose,
  handleMissionEnd,
  dismissModal,
  activityDuration,
  activityLabel
}) {
  const classes = useStyles();

  const dismiss = async () => {
    await dismissModal();
    handleClose();
  };

  return (
    <Dialog onClose={dismiss} open={open} scroll="paper">
      <CustomDialogTitle
        title={"⚠️ Mission terminée ?"}
        handleClose={handleClose}
      />
      <DialogContent>
        <Typography align="left" className={classes.warningText} key={0}>
          Votre activité "{activityLabel}" dure depuis plus de{" "}
          {activityDuration}. Voulez-vous terminer votre mission et ajuster
          l'horaire de fin ?
        </Typography>
      </DialogContent>
      <CustomDialogActions>
        <LoadingButton color="primary" onClick={dismiss}>
          Poursuivre la mission
        </LoadingButton>
        <MainCtaButton
          onClick={() => {
            dismiss().then(handleMissionEnd());
          }}
        >
          Terminer la mission
        </MainCtaButton>
      </CustomDialogActions>
    </Dialog>
  );
}
