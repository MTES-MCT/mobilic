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
import { CONTROL_TYPES } from "../../utils/useReadControlData";
import { useControl } from "../../utils/contextControl";

export function ControlBulletinFormStep3({
  handleEditControlBulletin,
  controlBulletin,
  grecoId,
  onUpdateGrecoId
}) {
  const { groupedAlerts, setIsReportingInfractions } = useInfractions();
  const { controlData, canDownloadBDC } = useControl();

  const groupedAlertsToDisplay = React.useMemo(() => {
    if (controlData.controlType === CONTROL_TYPES.LIC_PAPIER.label) {
      return (
        groupedAlerts.filter(
          group => group.alerts.filter(alert => alert.checked).length > 0
        ) || []
      );
    } else {
      return groupedAlerts;
    }
  }, [controlData, groupedAlerts]);

  React.useEffect(() => {
    setIsReportingInfractions(true);
  }, []);

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
      {groupedAlertsToDisplay?.length > 0 ? (
        <List>
          {groupedAlertsToDisplay.sort(sanctionComparator).map(group => (
            <ListItem key={`${group.type}_${group.sanction}`} disableGutters>
              <AlertGroup {...group} readOnlyAlerts={false} />
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
      {!canDownloadBDC && (
        <Notice
          type="warning"
          description="Certains champs obligatoires doivent être renseignés pour permettre le
          téléchargement du Bulletin de Contrôle."
        />
      )}
    </Stack>
  );
}
