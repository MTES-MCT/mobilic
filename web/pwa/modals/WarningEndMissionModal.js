import React from "react";
import Typography from "@mui/material/Typography";
import { LoadingButton } from "common/components/LoadingButton";
import { MainCtaButton } from "../components/MainCtaButton";
import Modal from "../../common/Modal";

export default function WarningEndMissionModal({
  open,
  handleClose,
  handleMissionEnd,
  dismissModal,
  activityDuration,
  activityLabel
}) {
  const dismiss = async () => {
    await dismissModal();
    handleClose();
  };

  return (
    <Modal
      open={open}
      handleClose={dismiss}
      size="sm"
      title="⚠️ Mission terminée ?"
      content={
        <Typography align="left">
          Votre activité "{activityLabel}" dure depuis plus de{" "}
          {activityDuration}. Voulez-vous terminer votre mission et ajuster
          l'horaire de fin ?
        </Typography>
      }
      actions={
        <>
          <MainCtaButton
            onClick={() => {
              dismiss().then(handleMissionEnd());
            }}
          >
            Terminer la mission
          </MainCtaButton>
          <LoadingButton color="primary" onClick={dismiss}>
            Poursuivre la mission
          </LoadingButton>
        </>
      }
    />
  );
}