import React from "react";

import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import { useControl } from "../../../utils/contextControl";
import { CONTROL_TYPES } from "../../../utils/useReadControlData";
import { ControllerControlEmployeeInfo } from "../../details/ControllerControlEmployeeInfo";
import { ControllerControlMissionInfo } from "../../details/ControllerControlMissionInfo";
import { ControllerControlDayPageInfo } from "../../details/ControllerControlDayPageInfo";
import { ControllerControlNote } from "../../details/ControllerControlNote";
import { ControllerControlNbCard } from "../../details/ControllerControlNbCard";

export function ControllerControlNoLicInformations({ setTab }) {
  const { controlData } = useControl();
  return (
    <Stack direction="column" p={3} rowGap={3}>
      <ControllerControlEmployeeInfo
        name={controlData.userFirstName + " " + controlData.userLastName}
      />
      <ControllerControlMissionInfo
        vehicleRegistrationNumber={controlData.vehicleRegistrationNumber}
        companyName={controlData.companyName}
      />
      {controlData.controlType === CONTROL_TYPES.LIC_PAPIER.label && (
        <ControllerControlDayPageInfo />
      )}
      <ControllerControlNote />
      <Grid container>
        <Grid item xs={6}>
          <ControllerControlNbCard
            label="Alertes réglementaires"
            buttonLabel="Alertes"
            nbElem={0}
            onClick={() => setTab("alerts")}
          />
        </Grid>
      </Grid>
    </Stack>
  );
}
