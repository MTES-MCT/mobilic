import React from "react";
import DialogTitle from "@material-ui/core/DialogTitle";
import Dialog from "@material-ui/core/Dialog";
import { formatPersonName } from "../../common/utils/coworkers";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import DialogContent from "@material-ui/core/DialogContent";
import { formatTimer } from "../../common/utils/time";
import Typography from "@material-ui/core/Typography";

export function DriverSelectionModal({
  team = [],
  open,
  currentDriver = undefined,
  currentDriverStartTime = null,
  handleClose,
  handleDriverSelection
}) {
  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle disableTypography>
        <Typography variant="h4">Choisir conducteur</Typography>
      </DialogTitle>
      <DialogContent>
        <RadioGroup
          aria-label="driver"
          name="driver"
          value={team.findIndex(tm => tm === currentDriver)}
          onChange={e => {
            handleDriverSelection(team[e.target.value]);
            handleClose();
          }}
        >
          {team.map((teamMate, index) => (
            <FormControlLabel
              key={index}
              value={index}
              control={<Radio />}
              label={`${formatPersonName(teamMate)}${
                currentDriver && teamMate.id === currentDriver.id
                  ? ` (conduit depuis ${formatTimer(
                      Date.now() - currentDriverStartTime
                    )})`
                  : ""
              }`}
              disabled={currentDriver && teamMate.id === currentDriver.id}
            />
          ))}
        </RadioGroup>
      </DialogContent>
    </Dialog>
  );
}
