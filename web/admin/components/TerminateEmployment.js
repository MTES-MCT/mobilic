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
          <Box my={2} className="flex-row-center">
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
