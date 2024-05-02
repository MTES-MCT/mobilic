import React from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "common/utils/TextField";
import { makeStyles } from "@mui/styles";
import { SubmitCancelButtons } from "../../../common/SubmitCancelButtons";
import { CONTROLLER_ADD_CONTROL_NOTE } from "common/utils/apiQueries";
import { formatApiError } from "common/utils/errors";
import { useSnackbarAlerts } from "../../../common/Snackbar";
import { useApi } from "common/utils/api";

const useStyles = makeStyles(() => ({
  addNoteButton: {
    textTransform: "none",
    textDecoration: "underline",
    fontSize: "1rem"
  },
  note: {
    whiteSpace: "pre-line"
  }
}));

export function ControllerControlNote({ controlData }) {
  const classes = useStyles();
  const [isEditing, setIsEditing] = React.useState(false);
  const [note, setNote] = React.useState(controlData.note);

  const alerts = useSnackbarAlerts();
  const api = useApi();

  React.useEffect(() => {
    if (controlData) {
      setNote(controlData.note);
    }
  }, [controlData]);

  const saveControlNote = async newNote => {
    try {
      const apiResponse = await api.graphQlMutate(
        CONTROLLER_ADD_CONTROL_NOTE,
        {
          controlId: controlData?.id,
          content: newNote || ""
        },
        { context: { nonPublicApi: true } }
      );
      controlData.note = apiResponse.data.controllerAddControlNote.note;
      setNote(apiResponse.data.controllerAddControlNote.note);
      setIsEditing(false);
    } catch (err) {
      alerts.error(formatApiError(err), "", 6000);
    }
  };

  return (
    <Stack spacing={0} sx={{ width: "100%" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" component="h2">
          Mes notes
        </Typography>
        {!isEditing && (
          <Button
            variant="text"
            className={classes.addNoteButton}
            onClick={() => setIsEditing(true)}
          >
            {note ? "Modifier mes notes" : "Ajouter des notes"}
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
            value={note}
            onChange={e => setNote(e.target.value)}
            margin="normal"
          />
          <SubmitCancelButtons
            onSubmit={() => {
              saveControlNote(note);
            }}
            onCancel={() => {
              setIsEditing(false);
              setNote(controlData.note);
            }}
          />
        </Stack>
      ) : (
        <Typography className={classes.note}>
          {note || "Vous n'avez pas encore renseigné d'annotations de contrôle"}
        </Typography>
      )}
    </Stack>
  );
}
