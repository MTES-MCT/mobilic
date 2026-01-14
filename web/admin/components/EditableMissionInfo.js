import React from "react";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CheckIcon from "@mui/icons-material/Check";
import { makeStyles } from "@mui/styles";
import CloseIcon from "@mui/icons-material/Close";
import { Button } from "@codegouvfr/react-dsfr/Button";

const useStyles = makeStyles((theme) => ({
  green: {
    color: theme.palette.success.main
  },
  disabled: {
    color: theme.palette.grey
  },
  editActions: {
    flexShrink: 0
  },
  value: {
    flexGrow: ({ fullWidth, isEditing }) => (fullWidth || isEditing ? 1 : 0),
    maxWidth: ({ fullWidth, isEditing }) =>
      fullWidth || !isEditing ? "none" : 300
  }
}));

export function EditableMissionInfo({
  value,
  format,
  renderEditMode,
  onEdit,
  disabledEdit,
  fullWidth,
  typographyProps = {},
  ...otherProps
}) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [newValue, setNewValue] = React.useState(value);

  const classes = useStyles({ fullWidth, isEditing });

  const disabled = isEditing && disabledEdit && disabledEdit(newValue);

  return (
    <Grid
      container
      spacing={2}
      wrap="nowrap"
      alignItems="center"
      {...otherProps}
    >
      <Grid item className={classes.value}>
        {isEditing ? (
          renderEditMode(newValue, setNewValue)
        ) : (
          <Typography {...typographyProps}>
            {format ? format(value) : value}
          </Typography>
        )}
      </Grid>
      {onEdit && (
        <Grid item className={classes.editActions}>
          {isEditing ? (
            <>
              <IconButton
                size="small"
                className="no-margin-no-padding"
                disabled={disabled}
                onClick={() => {
                  onEdit(newValue);
                  setIsEditing(false);
                }}
              >
                <CheckIcon
                  className={disabled ? classes.disabled : classes.green}
                />
              </IconButton>
              <IconButton
                size="small"
                className="no-margin-no-padding"
                onClick={() => {
                  setNewValue(value);
                  setIsEditing(false);
                }}
              >
                <CloseIcon color="error" />
              </IconButton>
            </>
          ) : (
            <Button
              priority="tertiary no outline"
              size="small"
              iconId="fr-icon-edit-line"
              onClick={() => {
                setIsEditing(true);
              }}
              title="Modifier"
            />
          )}
        </Grid>
      )}
    </Grid>
  );
}
