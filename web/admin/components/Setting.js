import React from "react";
import { makeStyles } from "@mui/styles";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useSnackbarAlerts } from "../../common/Snackbar";
import { formatApiError } from "common/utils/errors";
import Grid from "@mui/material/Grid";
import Switch from "@mui/material/Switch";

const useStyles = makeStyles(theme => ({
  description: {
    fontStyle: "italic"
  }
}));

export function Setting({
  label,
  name,
  value,
  description,
  descriptionStyle,
  renderInput,
  submitSettingChange,
  titleProps = {}
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

  const classes = useStyles();

  return (
    <Box p={1}>
      <Typography variant="h6" {...titleProps}>
        {label}
      </Typography>
      <Grid container spacing={4} alignItems="center" wrap="nowrap">
        <Grid item>{renderInput(value_, handleChange)}</Grid>
        <Grid item>
          <Typography
            className={`${classes.description}`}
            style={descriptionStyle}
          >
            {description}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
}

export function SimpleToggleSetting({
  label,
  name,
  value,
  description,
  submitSettingChange,
  titleProps = {}
}) {
  return (
    <Setting
      name={name}
      label={label}
      value={value}
      description={description}
      descriptionStyle={!value ? { opacity: 0.3 } : {}}
      submitSettingChange={submitSettingChange}
      renderInput={(value, handleChange) => (
        <Switch
          color="secondary"
          checked={value}
          onChange={e => handleChange(e.target.checked)}
        />
      )}
      titleProps={titleProps}
    />
  );
}
