import React from "react";
import { Link } from "react-router-dom";
import classNames from "classnames";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import { ControllerControlNoLicPreliminaryForm } from "./ControllerControlNoLicPreliminaryForm";
import { CONTROL_TYPES } from "../../utils/useReadControlData";
import { ControlDrawer } from "../../utils/ControlDrawer";

export function ControllerControlNewNoLic({
  isOpen,
  onClose,
  setControlOnFocus
}) {
  const onControlCreated = id => {
    onClose();
    setControlOnFocus({
      id,
      type: CONTROL_TYPES.NO_LIC
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
        <ControllerControlNoLicPreliminaryForm
          onSubmit={onControlCreated}
          onClose={onClose}
        />
      </Container>
    </ControlDrawer>
  );
}
