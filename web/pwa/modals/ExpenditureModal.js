import React from "react";
import Box from "@mui/material/Box";
import { getDaysBetweenTwoDates, now } from "common/utils/time";
import { Expenditures } from "../components/Expenditures";
import Modal from "../../common/Modal";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { ToggleSwitch } from "@codegouvfr/react-dsfr/ToggleSwitch";

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
              <ToggleSwitch
                label="Pour toute l'équipe"
                checked={forAllTeam}
                onChange={checked => setForAllTeam(checked)}
              />
            </Box>
          )}
        </>
      }
      actions={
        <>
          <Button
            onClick={() => {
              handleSubmit(expenditures, forAllTeam);
              handleClose();
            }}
          >
            Valider
          </Button>
        </>
      }
    />
  );
}
