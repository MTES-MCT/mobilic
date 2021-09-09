import React from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import Typography from "@material-ui/core/Typography";
import {
  CustomDialogActions,
  CustomDialogTitle
} from "../../common/CustomDialogTitle";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { LoadingButton } from "common/components/LoadingButton";
import { getActivityStartTimeToUse } from "common/utils/events";
import { now, formatWarningDurationTime } from "common/utils/time";
import { useStoreSyncedWithLocalStorage } from "common/utils/store";
import { ACTIVITIES } from "common/utils/activities";

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
    paddingBottom: theme.spacing(6)
  }
}));

export default function WarningEndMissionModal({
  handleClose,
  handleMissionEnd,
  latestActivity
}) {
  const classes = useStyles();

  const store = useStoreSyncedWithLocalStorage();
  const latestActivitySwitchExactTime =
    store.state.latestActivitySwitchExactTime;
  const currentActivityDuration = Math.max(
    now() -
      getActivityStartTimeToUse(latestActivity, latestActivitySwitchExactTime),
    0
  );

  const currentActivityLabel = latestActivity.endTime
    ? ACTIVITIES.break.label
    : ACTIVITIES[latestActivity.type].label;

  const shouldOpen =
    store.state.latestActivityIdDurationWarningDismiss !== latestActivity.id &&
    currentActivityDuration > 120;

  const dismissModal = () => {
    store.setState({
      latestActivityIdDurationWarningDismiss: latestActivity.id
    });
    handleClose();
  };

  const durationToDisplay = formatWarningDurationTime(currentActivityDuration);
  return (
    <Dialog
      onClose={dismissModal}
      open={shouldOpen}
      handleMissionEnd={handleMissionEnd}
      scroll="paper"
    >
      <CustomDialogTitle
        title={"⚠️ Mission terminée ?"}
        handleClose={handleClose}
      />
      <DialogContent className={classes.container}>
        <Typography align="left" className={classes.qrCodeText} key={0}>
          Votre activité "{currentActivityLabel}" dure depuis plus de{" "}
          {durationToDisplay}. Voulez-vous terminer votre mission et ajuster
          l'horaire de fin ?
        </Typography>
        <CustomDialogActions>
          <LoadingButton
            color="primary"
            onClick={async () => {
              handleClose();
            }}
          >
            Poursuivre la mission
          </LoadingButton>
          <LoadingButton
            variant="contained"
            color="primary"
            onClick={() => {
              handleClose();
              handleMissionEnd();
            }}
          >
            Terminer la mission
          </LoadingButton>
        </CustomDialogActions>
      </DialogContent>
    </Dialog>
  );
}
