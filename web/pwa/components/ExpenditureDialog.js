import React from "react";
import CheckIcon from "@material-ui/icons/Check";
import Dialog from "@material-ui/core/Dialog";
import IconButton from "@material-ui/core/IconButton";
import DialogContent from "@material-ui/core/DialogContent";
import { Expenditures } from "./Expenditures";
import FormControlLabel from "@material-ui/core/FormControlLabel/FormControlLabel";
import Switch from "@material-ui/core/Switch/Switch";
import Box from "@material-ui/core/Box";
import {
  CustomDialogActions,
  CustomDialogTitle
} from "../../common/CustomDialogTitle";

export default function ExpenditureDialogModal({
  open,
  currentExpenditures,
  hasTeamMates = false,
  handleClose,
  handleSubmit
}) {
  const [expenditures, setExpenditures] = React.useState({});
  const [forAllTeam, setForAllTeam] = React.useState(false);

  React.useEffect(() => {
    setExpenditures(currentExpenditures || {});
  }, [currentExpenditures, open]);

  return (
    <Dialog onClose={handleClose} open={open} fullWidth>
      <CustomDialogTitle title="Modifier les frais" handleClose={handleClose} />
      <DialogContent>
        <Expenditures
          expenditures={expenditures}
          setExpenditures={setExpenditures}
        />
        {hasTeamMates && (
          <Box mt={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={forAllTeam}
                  onChange={() => setForAllTeam(!forAllTeam)}
                  color="primary"
                />
              }
              label="Pour toute l'équipe"
              labelPlacement="end"
            />
          </Box>
        )}
      </DialogContent>
      <CustomDialogActions>
        <IconButton
          className="no-margin-no-padding"
          onClick={() => {
            handleSubmit(expenditures, forAllTeam);
            handleClose();
          }}
        >
          <CheckIcon color="primary" />
        </IconButton>
      </CustomDialogActions>
    </Dialog>
  );
}
