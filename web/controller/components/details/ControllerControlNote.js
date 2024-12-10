import React from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "common/utils/TextField";
import { makeStyles } from "@mui/styles";
import { SubmitCancelButtons } from "../../../common/SubmitCancelButtons";
import { CONTROLLER_ADD_CONTROL_NOTE } from "common/utils/apiQueries";
import { formatApiError } from "common/utils/errors";
import { useSnackbarAlerts } from "../../../common/Snackbar";
import { useApi } from "common/utils/api";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useControl } from "../../utils/contextControl";
import { Description } from "../../../common/typography/Description";

const useStyles = makeStyles(() => ({
  addNoteButton: {
    textDecoration: "underline"
  },
  note: {
    whiteSpace: "pre-line"
  }
}));

export function ControllerControlNote() {
  const classes = useStyles();
  const [isEditing, setIsEditing] = React.useState(false);
  const { controlData } = useControl();
  const [note, setNote] = React.useState(controlData.note || "");

  const alerts = useSnackbarAlerts();
  const api = useApi();

  React.useEffect(() => {
    if (controlData) {
      setNote(controlData.note || "");
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
            priority="tertiary"
            size="small"
            onClick={() => setIsEditing(true)}
          >
            {note ? "Modifier" : "Ajouter"}
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
      ) : note ? (
        <Typography className={classes.note}>{note}</Typography>
      ) : (
        <Description>
          Vous n'avez pas encore renseigné d'annotations de contrôle
        </Description>
      )}
    </Stack>
  );
}
