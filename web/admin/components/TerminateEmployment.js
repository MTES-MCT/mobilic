import React from "react";
import Typography from "@mui/material/Typography";
import DialogContent from "@mui/material/DialogContent";
import DatePicker from "@mui/lab/DatePicker";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import Box from "@mui/material/Box";
import { LoadingButton } from "common/components/LoadingButton";
import {
  CustomDialogActions,
  CustomDialogTitle
} from "../../common/CustomDialogTitle";
import { useSnackbarAlerts } from "../../common/Snackbar";
import { graphQLErrorMatchesCode } from "common/utils/errors";

export default function TerminateEmployment({
  open,
  terminateEmployment,
  minDate,
  handleClose
}) {
  const [endDate, setEndDate] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  const alerts = useSnackbarAlerts();

  React.useEffect(() => {
    const today = new Date(Date.now());
    setEndDate(minDate && minDate > today ? minDate : today);
  }, [minDate]);

  return (
    <Dialog onClose={handleClose} open={open}>
      <CustomDialogTitle
        handleClose={handleClose}
        title="Fin du rattachement"
      />
      <form
        noValidate
        autoComplete="off"
        onSubmit={async e => {
          e.preventDefault();
          setLoading(true);
          await alerts.withApiErrorHandling(
            async () => {
              await terminateEmployment(endDate);
              handleClose();
            },
            "terminate-employment",
            gqlError => {
              if (graphQLErrorMatchesCode(gqlError, "INVALID_INPUTS")) {
                return "Impossible de terminer à cette date. Vérifiez que le rattachement n'est pas déjà terminé et que le salarié n'a pas d'activités après la date choisie.";
              }
            }
          );
          setLoading(false);
        }}
      >
        <DialogContent>
          <Typography>⚠️⚠️⚠️</Typography>
          <Typography>
            Cette opération signale le départ d'un salarié : après la date
            choisie le salarié ne pourra plus enregistrer de temps de travail
            pour l'entreprise, ni accéder aux informations de l'entreprise.
          </Typography>
          <Typography>⚠️⚠️⚠️</Typography>
          <Box my={2} mt={4} className="flex-row-center">
            <DatePicker
              value={endDate}
              inputFormat="d MMMM yyyy"
              minDate={minDate}
              onChange={setEndDate}
              cancelLabel={null}
              autoOk
              inputVariant="outlined"
              animateYearScrolling
              renderInput={props => (
                <TextField
                  variant="standard"
                  label="Date de fin du rattachement"
                />
              )}
            />
          </Box>
        </DialogContent>
        <CustomDialogActions>
          <LoadingButton
            color="primary"
            variant="contained"
            type="submit"
            loading={loading}
          >
            Mettre fin
          </LoadingButton>
        </CustomDialogActions>
      </form>
    </Dialog>
  );
}
