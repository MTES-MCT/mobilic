import React from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { ControllerControlPreliminaryForm } from "./ControllerControlPreliminaryForm";
import { ControlDrawer } from "../../utils/ControlDrawer";
import { ControllerControlBackButton } from "../utils/ControllerControlBackButton";

export function ControllerControlNew({
  type,
  isOpen,
  onClose,
  setControlOnFocus
}) {
  const [submitted, setSubmitted] = React.useState(false);

  const onControlCreated = id => {
    setSubmitted(true);
    onClose();
    setControlOnFocus({
      id,
      type: type.label
      // Using label here because this is what is returned by API
      // on infraction display/edition and on BDC step 3 edition
    });
  };

  if (submitted && !isOpen) {
    return null;
  }

  return (
    <ControlDrawer isOpen={isOpen} onClose={onClose}>
      <Container>
        <Box marginBottom={2}>
          <ControllerControlBackButton onClick={onClose}>
            Fermer
          </ControllerControlBackButton>
        </Box>
        <Typography variant="h3" component="h1" sx={{ marginY: 2 }}>
          Nouveau contrôle “{type.label}”
        </Typography>
        <ControllerControlPreliminaryForm
          type={type}
          onSubmit={onControlCreated}
          onClose={onClose}
        />
      </Container>
    </ControlDrawer>
  );
}
