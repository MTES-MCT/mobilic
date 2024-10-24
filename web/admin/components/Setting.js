import React from "react";
import Box from "@mui/material/Box";
import { useSnackbarAlerts } from "../../common/Snackbar";
import { formatApiError } from "common/utils/errors";
import { ToggleSwitch } from "@codegouvfr/react-dsfr/ToggleSwitch";

export function SimpleToggleSetting({
  label,
  name,
  value,
  description,
  submitSettingChange
}) {
  const alerts = useSnackbarAlerts();

  const [value_, setValue_] = React.useState(value);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!isSubmitting) setValue_(value);
  }, [value]);

  async function handleChange(newValue) {
    setValue_(newValue);
    setIsSubmitting(true);
    try {
      await submitSettingChange(name, newValue);
    } catch (err) {
      setValue_(value);
      alerts.error(formatApiError(err), name, 6000);
    }
    setIsSubmitting(false);
  }

  return (
    <Box p={1}>
      <ToggleSwitch
        label={label}
        checked={value_}
        onChange={checked => handleChange(checked)}
      />
      <p className="fr-text--sm fr-my-2w">{description}</p>
    </Box>
  );
}
