import React, { useEffect, useState } from "react";
import { SimpleToggleSetting } from "./Setting";
import { Input } from "../../common/forms/Input";
import { Box, Stack } from "@mui/material";

export const OtherTask = ({
  otherTaskLabel,
  allowOtherTask,
  submitSettingChange
}) => {
  const [label, setLabel] = useState(otherTaskLabel);
  useEffect(() => setLabel(otherTaskLabel), [otherTaskLabel]);

  const onChangeLabel = async () => {
    if (label !== otherTaskLabel) {
      await submitSettingChange("otherTaskLabel", label);
    }
  };

  return (
    <Stack direction="column">
      <SimpleToggleSetting
        label="Utilisation du bouton « Autre tâche »"
        description="Permet de justifier de toute activité effectuée par le salarié autre que du déplacement (chargement, déménagement, livraison de plus de 5 min…), ou en cas d'évènement imprévu (litige, accident de travail…). Clarifiez l'utilisation du bouton auprès des salariés en le sous-titrant."
        name="allowOtherTask"
        value={allowOtherTask}
        submitSettingChange={submitSettingChange}
      />
      {allowOtherTask && (
        <Box maxWidth="350px">
          <Input
            label="Renseignez votre sous-titre :"
            hintText="12 caractères maximum autorisés"
            nativeInputProps={{
              value: label,
              onChange: e => {
                setLabel(e.target.value.trimStart());
              },
              onBlur: onChangeLabel,
              maxLength: 12
            }}
          />
        </Box>
      )}
    </Stack>
  );
};
