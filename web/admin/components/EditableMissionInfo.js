import React from "react";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import CheckIcon from "@material-ui/icons/Check";
import makeStyles from "@material-ui/core/styles/makeStyles";
import EditIcon from "@material-ui/icons/Edit";
import CloseIcon from "@material-ui/icons/Close";

const useStyles = makeStyles(theme => ({
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
  typographyProps = {}
}) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [newValue, setNewValue] = React.useState(value);

  const classes = useStyles({ fullWidth, isEditing });

  const disabled = isEditing && disabledEdit && disabledEdit(newValue);

  return (
    <Grid container spacing={2} wrap="nowrap" alignItems="center">
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
            <IconButton
              color="primary"
              className="no-margin-no-padding"
              onClick={() => {
                setIsEditing(true);
              }}
            >
              <EditIcon />
            </IconButton>
          )}
        </Grid>
      )}
    </Grid>
  );
}
