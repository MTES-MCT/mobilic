import React from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Notice from "../../../common/Notice";
import { InfoItem } from "../../../home/InfoField";

export function ControllerControlMissionInfo({
  vehicleRegistrationNumber,
  companyName
}) {
  if (!companyName) {
    return (
      <Notice
        type="warning"
        description="Aucune saisie en cours au moment du contrôle"
      />
    );
  }

  return (
    <Stack rowGap={1}>
      <Typography variant="h6" component="h2">
        Mission lors du contrôle
      </Typography>
      <Stack direction="column">
        <InfoItem
          name="Véhicule"
          value={vehicleRegistrationNumber || "Non renseigné"}
          uppercaseTitle={false}
        />
        <InfoItem
          name="Entreprise"
          value={companyName}
          uppercaseTitle={false}
        />
      </Stack>
    </Stack>
  );
}
