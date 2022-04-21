import React from "react";
import IconButton from "@mui/material/IconButton";
import CheckIcon from "@mui/icons-material/Check";
import { makeStyles } from "@mui/styles";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";

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
