import React from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { Link } from "../../../common/LinkButton";

export function ControlBulletinCreationButtons({
  controlData,
  openBulletinControl
}) {
  return [
    !controlData.controlBulletin && (
      <Stack key={0} direction="column" spacing={2} mt={2} alignItems="center">
        <Button
          color="primary"
          variant="contained"
          size="small"
          onClick={openBulletinControl}
        >
          Éditer un bulletin de contrôle
        </Button>
      </Stack>
    ),
    controlData.controlBulletin && (
      <Stack key={10} direction="column" spacing={2} mt={2} alignItems="center">
        <Button color="secondary" variant="outlined" size="small">
          Télécharger le bulletin de contrôle
        </Button>
        <Link
          onClick={e => {
            e.preventDefault();
            openBulletinControl();
          }}
        >
          Modifier le bulletin de contrôle
        </Link>
      </Stack>
    )
  ];
}
