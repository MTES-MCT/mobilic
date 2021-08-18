import React from "react";
import IconButton from "@material-ui/core/IconButton";
import CheckIcon from "@material-ui/icons/Check";
import makeStyles from "@material-ui/core/styles/makeStyles";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import CloseIcon from "@material-ui/icons/Close";

const useStyles = makeStyles(theme => ({
  saveIcon: {
    color: theme.palette.success.main
  },
  disabledIcon: {
    color: theme.palette.grey
  },
  cancelCreationButton: {
    marginLeft: theme.spacing(1)
  }
}));

export function AugmentedTableEditActions({
  entry,
  columns,
  isAddingRow,
  isEditingRow,
  onCustomActionsClick,
  onRowAdd,
  onRowEdit,
  onRowDelete,
  onStartRowEdit,
  onTerminateRowEdit,
  editedValues,
  setEditedValues,
  validateRow
}) {
  const classes = useStyles();

  if (
    !isAddingRow &&
    !isEditingRow &&
    !onRowEdit &&
    !onRowDelete &&
    !onCustomActionsClick
  ) {
    return null;
  }

  if (isAddingRow || isEditingRow) {
    const invalidRow =
      validateRow && !validateRow({ ...entry, ...editedValues });

    return (
      <>
        <IconButton
          size="small"
          className="no-margin-no-padding"
          color="success"
          disabled={invalidRow}
          onClick={async () => {
            if (isEditingRow) await onRowEdit(entry, { ...editedValues });
            else await onRowAdd(entry);
            onTerminateRowEdit();
          }}
        >
          <CheckIcon
            className={invalidRow ? classes.disabled : classes.saveIcon}
          />
        </IconButton>
        <IconButton
          size="small"
          className="no-margin-no-padding"
          onClick={onTerminateRowEdit}
        >
          <CloseIcon color="error" />
        </IconButton>
      </>
    );
  }

  if (onCustomActionsClick)
    return (
      <IconButton
        size="small"
        color="primary"
        onClick={e => onCustomActionsClick(e, entry)}
      >
        <MoreVertIcon />
      </IconButton>
    );

  return (
    <>
      {onRowEdit && (
        <IconButton
          className="no-margin-no-padding"
          color="primary"
          onClick={() => {
            const initialValues = {};
            columns.forEach(column => {
              if (column.edit) initialValues[column.name] = entry[column.name];
            });
            setEditedValues(initialValues);
            onStartRowEdit();
          }}
        >
          <EditIcon />
        </IconButton>
      )}
      {onRowDelete && (
        <IconButton
          className="no-margin-no-padding"
          onClick={() => onRowDelete(entry)}
        >
          <DeleteIcon color="error" />
        </IconButton>
      )}
    </>
  );
}
