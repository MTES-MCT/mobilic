import React from "react";
import CheckIcon from "@mui/icons-material/Check";
import IconButton from "@mui/material/IconButton";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Box from "@mui/material/Box";
import { getDaysBetweenTwoDates, now } from "common/utils/time";
import { Expenditures } from "../components/Expenditures";
import Modal from "../../common/Modal";

export default function ExpenditureModal({
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
    <Modal
      open={open}
      handleClose={handleClose}
      size="sm"
      title={title || "Modifier les frais"}
      content={
        <>
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
        </>
      }
      actions={
        <>
          <IconButton
            className="no-margin-no-padding"
            onClick={() => {
              handleSubmit(expenditures, forAllTeam);
              handleClose();
            }}
          >
            <CheckIcon color="primary" />
          </IconButton>
        </>
      }
    />
  );
}
