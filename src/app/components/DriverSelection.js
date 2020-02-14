import React from "react";
import DialogTitle from "@material-ui/core/DialogTitle";
import Dialog from "@material-ui/core/Dialog";
import { formatPersonName } from "../../common/utils/coworkers";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import DialogContent from "@material-ui/core/DialogContent";
import { formatTimer } from "../../common/utils/time";

export function DriverSelectionModal({
  team = [],
  open,
  currentDriverIdx = -1,
  currentDriverStartTime = null,
  handleClose,
  handleDriverSelection
}) {
  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle>Choisir conducteur</DialogTitle>
      <DialogContent>
        <RadioGroup
          aria-label="driver"
          name="driver"
          value={currentDriverIdx}
          onChange={e => {
            handleDriverSelection(e.target.value);
            handleClose();
          }}
        >
          {team.map((teamMate, index) => (
            <FormControlLabel
              key={index}
              value={index}
              control={<Radio />}
              label={`${formatPersonName(teamMate)}${
                index === currentDriverIdx
                  ? ` (conduit depuis ${formatTimer(
                      Date.now() - currentDriverStartTime
                    )})`
                  : ""
              }`}
              disabled={index === currentDriverIdx}
            />
          ))}
        </RadioGroup>
      </DialogContent>
    </Dialog>
  );
}
