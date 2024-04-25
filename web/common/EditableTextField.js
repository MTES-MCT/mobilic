import React, { useState, useEffect, useMemo } from "react";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import { isStringLengthValid } from "common/utils/validation";

function EditableTextField({
  text,
  onSave,
  onCancel,
  className,
  maxLength = 255,
  component = undefined
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(text);
  const [error, setError] = useState(false);
  const errorText = `La longueur du texte doit être·comprise entre 1 et ${maxLength} caractères.`;

  useEffect(() => {
    setEditedText(text);
  }, [text]);

  const isSaveButtonDisabled = useMemo(() => {
    return !isStringLengthValid(editedText, maxLength) || text === editedText;
  }, [editedText, maxLength, text]);

  const handleSave = () => {
    if (isStringLengthValid(editedText, maxLength) && text !== editedText) {
      onSave(editedText);
      setIsEditing(false);
      setError(false);
    }
    if (!isStringLengthValid(editedText, maxLength)) {
      setError(true);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    setEditedText(text);
    setIsEditing(false);
    setError(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  return (
    <Typography variant="h3" component={component} className={className}>
      {isEditing ? (
        <>
          <TextField
            value={editedText}
            onChange={e => {
              const newText = e.target.value;
              setEditedText(newText);
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={handleSave}
                    disabled={isSaveButtonDisabled}
                    color="success"
                  >
                    <CheckIcon />
                  </IconButton>
                  <IconButton size="small" onClick={handleCancel} color="error">
                    <CloseIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
            error={error}
            helperText={error ? errorText : ""}
          />
        </>
      ) : (
        <>
          {editedText}
          <IconButton color="primary" onClick={handleEdit}>
            <EditIcon />
          </IconButton>
        </>
      )}
    </Typography>
  );
}

export default EditableTextField;
