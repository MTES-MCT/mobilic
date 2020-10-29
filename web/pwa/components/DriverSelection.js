import React from "react";
import DialogTitle from "@material-ui/core/DialogTitle";
import Dialog from "@material-ui/core/Dialog";
import { formatPersonName } from "common/utils/coworkers";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import DialogContent from "@material-ui/core/DialogContent";
import { formatTimer, now } from "common/utils/time";
import Typography from "@material-ui/core/Typography";
import { useStoreSyncedWithLocalStorage } from "common/utils/store";

export function DriverSelectionModal({
  team = [],
  open,
  currentDriverId = undefined,
  currentDriverStartTime = null,
  handleClose,
  handleDriverSelection
}) {
  const store = useStoreSyncedWithLocalStorage();
  const coworkers = store.getEntity("coworkers");

  const hasTeamMates = team.length > 1;
  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle disableTypography>
        <Typography variant="h4">
          {hasTeamMates ? "Choisir conducteur" : "Êtes-vous le conducteur ?"}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <RadioGroup
          aria-label="driver"
          name="driver"
          value={team.findIndex(id => id === currentDriverId)}
          onChange={e => {
            handleDriverSelection(parseInt(e.target.value));
            handleClose();
          }}
        >
          {team.map((teamMateId, index) => (
            <FormControlLabel
              key={index}
              value={teamMateId}
              control={<Radio />}
              label={
                hasTeamMates
                  ? `${
                      teamMateId === store.userId()
                        ? formatPersonName(store.userInfo())
                        : coworkers[teamMateId.toString()]
                        ? formatPersonName(coworkers[teamMateId.toString()])
                        : "Inconnu"
                    }${
                      currentDriverId && teamMateId === currentDriverId
                        ? ` (conduit depuis ${formatTimer(
                            now() - currentDriverStartTime
                          )})`
                        : ""
                    }`
                  : "Oui"
              }
              disabled={currentDriverId && teamMateId === currentDriverId}
            />
          ))}
          <FormControlLabel
            key={-1}
            value={-1}
            checked={false}
            control={<Radio />}
            label={hasTeamMates ? "Une autre personne" : "Non"}
          />
        </RadioGroup>
      </DialogContent>
    </Dialog>
  );
}
