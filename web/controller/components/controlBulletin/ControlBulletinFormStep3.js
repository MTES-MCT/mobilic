import React from "react";

import Stack from "@mui/material/Stack";
import { Typography } from "@mui/material";
import Alert from "@mui/material/Alert";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import { AlertGroup } from "../../../control/components/AlertGroup";
import { Input } from "../../../common/forms/Input";

export function ControlBulletinFormStep3({
  handleEditControlBulletin,
  controlBulletin,
  grecoId,
  onUpdateGrecoId,
  controlCanBeDownloaded,
  groupedAlerts,
  onUpdateInfraction
}) {
  return (
    <Stack direction="column" p={2} sx={{ width: "100%" }}>
      <Input
        nativeInputProps={{
          value: grecoId,
          name: "grecoId",
          onChange: e => onUpdateGrecoId(e.target.value)
        }}
        label="Votre identifiant de carte contrôleur"
      />
      <Typography variant="h5">Infractions retenues</Typography>
      {groupedAlerts?.length > 0 ? (
        <List>
          {groupedAlerts
            .sort((alert1, alert2) =>
              alert1.sanction.localeCompare(alert2.sanction)
            )
            .map(group => (
              <ListItem key={`${group.type}_${group.sanction}`} disableGutters>
                <AlertGroup
                  {...group}
                  isReportingInfractions={true}
                  onUpdateInfraction={onUpdateInfraction}
                  readOnlyAlerts={false}
                />
              </ListItem>
            ))}
        </List>
      ) : (
        <Typography>
          Il n'y a aucune alerte réglementaire sur la période
        </Typography>
      )}
      <Input
        nativeInputProps={{
          value: controlBulletin.observation || "",
          name: "observation",
          onChange: e => handleEditControlBulletin(e)
        }}
        label="Observations"
        textArea
      />
      {!controlCanBeDownloaded && (
        <Alert severity="warning">
          Certains champs obligatoires doivent être renseignés pour permettre le
          téléchargement du Bulletin de Contrôle.
        </Alert>
      )}
    </Stack>
  );
}
