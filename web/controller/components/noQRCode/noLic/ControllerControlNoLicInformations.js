import React from "react";

import { Stack } from "@mui/material";
import { useControl } from "../../../utils/contextControl";
import { CONTROL_TYPES } from "../../../utils/useReadControlData";
import { ControllerControlEmployeeInfo } from "../../details/ControllerControlEmployeeInfo";
import { ControllerControlMissionInfo } from "../../details/ControllerControlMissionInfo";
import { ControllerControlDayPageInfo } from "../../details/ControllerControlDayPageInfo";
import { ControllerControlNote } from "../../details/ControllerControlNote";
import { ControllerControlNbCard } from "../../details/ControllerControlNbCard";

export function ControllerControlNoLicInformations() {
  const { controlData } = useControl();
  return (
    <Stack
      direction="column"
      spacing={2}
      paddingLeft={2}
      paddingRight={1}
      rowGap={4}
      alignItems="center"
    >
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
      <ControllerControlNbCard
        label="Alertes réglementaires"
        buttonLabel="Alertes"
        nbElem={0}
        onClick={() => console.log("TODO 1660")}
      />
    </Stack>
  );
}
