import React from "react";
import Dialog from "@material-ui/core/Dialog";
import { formatPersonName } from "common/utils/coworkers";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import DialogContent from "@material-ui/core/DialogContent";
import { formatTimer, now } from "common/utils/time";
import { useStoreSyncedWithLocalStorage } from "common/utils/store";
import { CustomDialogTitle } from "../../common/CustomDialogTitle";

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

  const [selected, setSelected] = React.useState(null);

  React.useEffect(() => {
    setSelected(null);
  }, [open, currentDriverId]);

  const hasTeamMates = team.length > 1;
  return (
    <Dialog onClose={handleClose} open={open}>
      <CustomDialogTitle
        title={
          hasTeamMates ? "Choisir conducteur" : "Êtes-vous le conducteur ?"
        }
        handleClose={handleClose}
      />
      <DialogContent>
        <RadioGroup
          aria-label="driver"
          name="driver"
          value={selected || team.findIndex(id => id === currentDriverId)}
          onChange={async e => {
            const value = parseInt(e.target.value);
            setSelected(value);
            await Promise.all([
              new Promise(resolve => setTimeout(resolve, 500)),
              setTimeout(() => handleDriverSelection(value), 0)
            ]);
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
              checked={currentDriverId && teamMateId === currentDriverId}
              disabled={currentDriverId && teamMateId === currentDriverId}
            />
          ))}
          <FormControlLabel
            key={-1}
            value={-2}
            control={<Radio />}
            label={hasTeamMates ? "Une autre personne" : "Non"}
          />
        </RadioGroup>
      </DialogContent>
    </Dialog>
  );
}
