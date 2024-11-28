import React from "react";

import Stack from "@mui/material/Stack";
import { Typography } from "@mui/material";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import { AlertGroup } from "../../../control/components/Alerts/AlertGroup";
import { Input } from "../../../common/forms/Input";
import Notice from "../../../common/Notice";
import { useInfractions } from "../../utils/contextInfractions";
import { sanctionComparator } from "../../../control/utils/sanctionComparator";

export function ControlBulletinFormStep3({
  controlData,
  handleEditControlBulletin,
  controlBulletin,
  grecoId,
  onUpdateGrecoId,
  controlCanBeDownloaded,
  onUpdateInfraction
}) {
  const { groupedAlerts } = useInfractions();
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
          {groupedAlerts.sort(sanctionComparator).map(group => (
            <ListItem key={`${group.type}_${group.sanction}`} disableGutters>
              <AlertGroup
                {...group}
                controlData={controlData}
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
        <Notice
          type="warning"
          description="Certains champs obligatoires doivent être renseignés pour permettre le
          téléchargement du Bulletin de Contrôle."
        />
      )}
    </Stack>
  );
}
