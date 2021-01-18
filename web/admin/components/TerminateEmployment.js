import React from "react";
import DialogTitle from "@material-ui/core/DialogTitle";
import Typography from "@material-ui/core/Typography";
import DialogContent from "@material-ui/core/DialogContent";
import { DatePicker } from "@material-ui/pickers";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import Box from "@material-ui/core/Box";
import { LoadingButton } from "common/components/LoadingButton";
import * as Sentry from "@sentry/browser";

export function TerminateEmployment({
  open,
  terminateEmployment,
  minDate,
  handleClose
}) {
  const [endDate, setEndDate] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const today = new Date(Date.now());
    setEndDate(minDate && minDate > today ? minDate : today);
  }, [minDate]);

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle disableTypography>
        <Typography variant="h4">Fin du rattachement</Typography>
      </DialogTitle>
      <form
        noValidate
        autoComplete="off"
        onSubmit={async e => {
          e.preventDefault();
          try {
            setLoading(true);
            await terminateEmployment(endDate);
            handleClose();
          } catch (err) {
            Sentry.captureException(err);
            console.log(err);
          }
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
          <DialogActions>
            <LoadingButton
              color="primary"
              variant="contained"
              type="submit"
              loading={loading}
            >
              Terminer
            </LoadingButton>
          </DialogActions>
        </DialogContent>
      </form>
    </Dialog>
  );
}
