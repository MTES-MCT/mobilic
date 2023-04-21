import React from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "common/utils/TextField";
import { makeStyles } from "@mui/styles";
import { SubmitCancelButtons } from "./SubmitCancelButtons";

const useStyles = makeStyles(theme => ({
  addNotesButton: {
    textTransform: "none",
    textDecoration: "underline"
  },
  notes: {
    whiteSpace: "pre-line"
  }
}));
export function ControllerControlNoLicInformationsNotes({ notes, setNotes }) {
  const classes = useStyles();
  const [isEditing, setIsEditing] = React.useState(false);
  const [editingNotes, setEditingNotes] = React.useState(notes);
  return (
    <Stack spacing={1} sx={{ width: "100%" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">Mes notes</Typography>
        {!isEditing && (
          <Button
            variant="text"
            className={classes.addNotesButton}
            onClick={() => setIsEditing(true)}
          >
            {notes ? "Modifier mes notes" : "Ajouter des notes"}
          </Button>
        )}
      </Stack>
      {isEditing ? (
        <Stack direction="column">
          <TextField
            fullWidth
            multiline
            maxRows={4}
            variant="filled"
            value={editingNotes}
            onChange={e => setEditingNotes(e.target.value)}
            margin="normal"
          />
          <SubmitCancelButtons
            onSubmit={() => {
              setNotes(editingNotes);
              setIsEditing(false);
            }}
            onCancel={() => {
              setEditingNotes(notes);
              setIsEditing(false);
            }}
          />
        </Stack>
      ) : (
        <Typography className={classes.notes}>
          {notes ||
            "Vous n'avez pas encore renseigné d'annotations de contrôle"}
        </Typography>
      )}
    </Stack>
  );
}
