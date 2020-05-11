import React from "react";
import CheckIcon from "@material-ui/icons/Check";
import DialogTitle from "@material-ui/core/DialogTitle";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import DialogContent from "@material-ui/core/DialogContent";
import { Expenditures } from "./Expenditures";

export function ExpenditureDialogModal({
  open,
  currentExpenditures,
  handleClose,
  handleSubmit
}) {
  const [expenditures, setExpenditures] = React.useState({});

  React.useEffect(() => {
    setExpenditures(currentExpenditures || {});
  }, [currentExpenditures, open]);

  return (
    <Dialog onClose={handleClose} open={open} fullWidth>
      <DialogTitle disableTypography>
        <Typography variant="h4">Editer les frais</Typography>
      </DialogTitle>
      <DialogContent>
        <Expenditures
          expenditures={expenditures}
          setExpenditures={setExpenditures}
        />
      </DialogContent>
      <DialogActions>
        <IconButton
          onClick={(...args) => {
            handleSubmit(expenditures);
            handleClose();
          }}
        >
          <CheckIcon color="primary" />
        </IconButton>
      </DialogActions>
    </Dialog>
  );
}
