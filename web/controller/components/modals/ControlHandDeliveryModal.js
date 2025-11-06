import React from "react";
import Modal from "../../../common/Modal";
import { Typography, Box } from "@mui/material";
import { ButtonsGroup } from "@codegouvfr/react-dsfr/ButtonsGroup";

export default function ControlHandDeliveryModal({
  open,
  handleClose,
  handleConfirm,
  handleCancel
}) {
  return (
    <Modal
      open={open}
      handleClose={handleClose}
      title="Remise du bulletin de contrôle"
      size="sm"
      content={
        <>
          <Typography gutterBottom>
            Le bulletin de contrôle a-t-il été remis au conducteur au format
            papier ?
          </Typography>
          <Box mt={3}>
            <ButtonsGroup
              buttons={[
                {
                  children: "Oui",
                  priority: "primary",
                  onClick: () => {
                    if (handleConfirm) handleConfirm();
                  }
                },
                {
                  children: "Non",
                  priority: "secondary",
                  onClick: () => {
                    if (handleCancel) handleCancel();
                  }
                }
              ]}
              inlineLayoutWhen="always"
              alignment="right"
            />
          </Box>
        </>
      }
    />
  );
}
