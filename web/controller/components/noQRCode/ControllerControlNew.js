import React from "react";
import { Button } from "@codegouvfr/react-dsfr/Button";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { ControllerControlPreliminaryForm } from "./ControllerControlPreliminaryForm";
import { ControlDrawer } from "../../utils/ControlDrawer";

export function ControllerControlNew({
  type,
  isOpen,
  onClose,
  setControlOnFocus
}) {
  const onControlCreated = id => {
    onClose();
    setControlOnFocus({
      id,
      type: type.label
      // Using label here because this is what is returned by API
      // on infraction display/edition and on BDC step 3 edition
    });
  };
  return (
    <ControlDrawer isOpen={isOpen} onClose={onClose}>
      <Container>
        <Box marginBottom={2}>
          <Button
            onClick={onClose}
            priority="tertiary no outline"
            iconId="fr-icon-arrow-left-s-line"
            iconPosition="left"
            style={{ textDecoration: "underline" }}
          >
            Fermer
          </Button>
        </Box>
        <Typography variant="h4" component="h1" sx={{ marginY: 2 }}>
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
