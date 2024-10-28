import React from "react";
import { Link } from "react-router-dom";
import classNames from "classnames";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { ControllerControlPreliminaryForm } from "../ControllerControlPreliminaryForm";
import { CONTROL_TYPES } from "../../../utils/useReadControlData";
import { ControlDrawer } from "../../../utils/ControlDrawer";

export function ControllerControlNewNoLic({
  isOpen,
  onClose,
  setControlOnFocus
}) {
  const type = CONTROL_TYPES.NO_LIC;
  const onControlCreated = id => {
    onClose();
    setControlOnFocus({
      id,
      type
    });
  };
  return (
    <ControlDrawer isOpen={isOpen} onClose={onClose}>
      <Container>
        <Box marginBottom={2}>
          <Link
            to="#"
            className={classNames(
              "fr-link",
              "fr-fi-arrow-left-line",
              "fr-link--icon-left"
            )}
            onClick={onClose}
          >
            Fermer
          </Link>
        </Box>
        <Typography variant="h4" component="h1" sx={{ marginY: 2 }}>
          Nouveau contrôle “Pas de LIC à bord”
        </Typography>
        <p>
          Veuillez renseigner ces informations afin de créer le contrôle&nbsp;:
        </p>
        <ControllerControlPreliminaryForm
          type={type}
          onSubmit={onControlCreated}
          onClose={onClose}
        />
      </Container>
    </ControlDrawer>
  );
}
