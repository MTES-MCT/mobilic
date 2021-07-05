import React from "react";
import Typography from "@material-ui/core/Typography";
import DialogContent from "@material-ui/core/DialogContent";
import { DatePicker } from "@material-ui/pickers";
import Dialog from "@material-ui/core/Dialog";
import Box from "@material-ui/core/Box";
import { LoadingButton } from "common/components/LoadingButton";
import {
  CustomDialogActions,
  CustomDialogTitle
} from "../../common/CustomDialogTitle";
import { useSnackbarAlerts } from "../../common/Snackbar";

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
          await alerts.withApiErrorHandling(async () => {
            await terminateEmployment(endDate);
            handleClose();
          }, "terminate-employment");
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
              label="Date de fin du rattachement"
              value={endDate}
              format="d MMMM yyyy"
              minDate={minDate}
              onChange={setEndDate}
              cancelLabel={null}
              autoOk
              inputVariant="outlined"
              animateYearScrolling
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
