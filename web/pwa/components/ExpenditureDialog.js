import React from "react";
import CheckIcon from "@mui/icons-material/Check";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import DialogContent from "@mui/material/DialogContent";
import { Expenditures } from "./Expenditures";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Box from "@mui/material/Box";
import {
  CustomDialogActions,
  CustomDialogTitle
} from "../../common/CustomDialogTitle";
import { getDaysBetweenTwoDates, now } from "common/utils/time";

export default function ExpenditureDialogModal({
  open,
  currentExpenditures,
  title = null,
  hasTeamMates = false,
  missionStartTime,
  missionEndTime,
  handleClose,
  handleSubmit
}) {
  const [expenditures, setExpenditures] = React.useState({});
  const [forAllTeam, setForAllTeam] = React.useState(true);

  React.useEffect(() => {
    setExpenditures(currentExpenditures || {});
  }, [currentExpenditures, open]);

  return (
    <Dialog onClose={handleClose} open={open} fullWidth>
      <CustomDialogTitle
        title={title || "Modifier les frais"}
        handleClose={handleClose}
      />
      <DialogContent>
        <Expenditures
          expenditures={expenditures}
          setExpenditures={setExpenditures}
          listPossibleSpendingDays={getDaysBetweenTwoDates(
            missionStartTime,
            missionEndTime || now()
          )}
        />
        {hasTeamMates && (
          <Box mt={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={forAllTeam}
                  onChange={() => setForAllTeam(!forAllTeam)}
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
