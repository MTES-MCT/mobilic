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
import { Button } from "@codegouvfr/react-dsfr/Button";

export function ControlBulletinFormStep3({
  handleEditControlBulletin,
  controlBulletin,
  grecoId,
  onUpdateGrecoId,
  onModifyInfractions
}) {
  const {
    groupedAlerts,
    isReportingInfractions,
    setIsReportingInfractions
  } = useInfractions();
  const { controlData, canDownloadBDC } = useControl();

  const groupedAlertsToDisplay = React.useMemo(() => {
    if (
      controlData.controlType === CONTROL_TYPES.LIC_PAPIER.label &&
      !isReportingInfractions
    ) {
      return (
        groupedAlerts.filter(
          group => group.alerts.filter(alert => alert.checked).length > 0
        ) || []
      );
    } else {
      return groupedAlerts;
    }
  }, [controlData, groupedAlerts, isReportingInfractions]);

  React.useEffect(() => {
    setIsReportingInfractions(false);
  }, []);

  return (
    <Stack direction="column" p={2} sx={{ width: "100%" }}>
      <Input
        nativeInputProps={{
          value: grecoId,
          name: "grecoId",
          onChange: e => onUpdateGrecoId(e.target.value)
        }}
        label="Numéro de contrôleur"
        hintText="Numéro présent sur votre carte contrôleur"
      />
      <Stack
        direction="row"
        justifyContent="space-between"
        sx={{ width: "100%" }}
      >
        <Typography>Infractions retenues</Typography>
        {!isReportingInfractions && (
          <Button
            priority="tertiary"
            size="small"
            onClick={() => {
              onModifyInfractions();
              setIsReportingInfractions(true);
            }}
          >
            Modifier
          </Button>
        )}
      </Stack>
      {groupedAlertsToDisplay?.length > 0 ? (
        <List>
          {groupedAlertsToDisplay.sort(sanctionComparator).map(group => (
            <ListItem key={`${group.type}_${group.sanction}`} disableGutters>
              <AlertGroup {...group} readOnlyAlerts={false} />
            </ListItem>
          ))}
        </List>
      ) : (
        <Notice
          sx={{ marginTop: 1, marginBottom: 3 }}
          type="info"
          description="Il n'y a aucune alerte réglementaire sur la période."
        />
      )}
      <Input
        nativeTextAreaProps={{
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
