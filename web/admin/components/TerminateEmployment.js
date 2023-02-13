import React from "react";
import Alert from "@mui/material/Alert";
import DialogContent from "@mui/material/DialogContent";
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
import { MobileDatePicker } from "@mui/x-date-pickers";

export default function TerminateEmployment({
  open,
  terminateEmployment,
  minDate,
  handleClose
}) {
  const [endDate, setEndDate] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  const alerts = useSnackbarAlerts();
  const today = new Date();

  React.useEffect(() => {
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
                return "Impossible de terminer à cette date. La date de fin du rattachement doit être postérieure à la date de début.";
              }
            }
          );
          setLoading(false);
        }}
      >
        <DialogContent>
          <Alert severity="warning">
            Cette opération signale le départ d'un salarié : après la date
            choisie le salarié ne pourra plus enregistrer de temps de travail
            pour l'entreprise, ni accéder aux informations de l'entreprise.
            <br />
            En tant que gestionnaire, vous ne pourrez plus ajouter de missions
            dans le passé pour le compte de ce salarié.
          </Alert>
          <Box my={2} mt={4} className="flex-row-center">
            <MobileDatePicker
              label="Date de fin du rattachement"
              value={endDate}
              inputFormat="d MMMM yyyy"
              minDate={minDate}
              onChange={setEndDate}
              cancelText={null}
              disableCloseOnSelect={false}
              disableMaskedInput={true}
              maxDate={today}
              renderInput={props => <TextField {...props} variant="outlined" />}
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
