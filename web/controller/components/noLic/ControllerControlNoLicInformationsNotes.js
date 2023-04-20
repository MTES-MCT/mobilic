import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "common/utils/TextField";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles(theme => ({
  row: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "nowrap",
    alignItems: "center"
  },
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
    <Box>
      <Box className={classes.row}>
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
      </Box>
      {isEditing ? (
        <Box>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            variant="filled"
            value={editingNotes}
            onChange={e => setEditingNotes(e.target.value)}
            margin="normal"
          />
          <Box>
            <Button
              size="small"
              color="primary"
              variant="contained"
              onClick={() => {
                setNotes(editingNotes);
                setIsEditing(false);
              }}
            >
              Enregistrer
            </Button>
            <Button
              size="small"
              color="primary"
              variant="outlined"
              onClick={() => {
                setEditingNotes(notes);
                setIsEditing(false);
              }}
            >
              Annuler
            </Button>
          </Box>
        </Box>
      ) : (
        <Typography className={classes.notes}>
          {notes ||
            "Vous n'avez pas encore renseigné d'annotations de contrôle"}
        </Typography>
      )}
    </Box>
  );
}
