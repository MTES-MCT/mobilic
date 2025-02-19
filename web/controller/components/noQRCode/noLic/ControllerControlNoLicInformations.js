import React from "react";

import Stack from "@mui/material/Stack";
import { useControl } from "../../../utils/contextControl";
import { ControllerControlEmployeeInfo } from "../../details/ControllerControlEmployeeInfo";
import { ControllerControlMissionInfo } from "../../details/ControllerControlMissionInfo";
import { ControllerControlNote } from "../../details/ControllerControlNote";
import { ControllerControlNbCards } from "../../details/ControllerControlNbCard";
import { useInfractions } from "../../../utils/contextInfractions";
import { CONTROL_TYPES } from "../../../utils/useReadControlData";
import { ControllerControlPictures } from "../../details/ControllerControlPictures";

export function ControllerControlNoLicInformations({ onChangeTab }) {
  const { controlData, controlType } = useControl();
  const { checkedAlertsNumber } = useInfractions() ?? {};
  return (
    <Stack direction="column" p={3} rowGap={3} width="100%">
      <ControllerControlEmployeeInfo
        name={controlData.userFirstName + " " + controlData.userLastName}
      />
      <ControllerControlMissionInfo
        vehicleRegistrationNumber={controlData.vehicleRegistrationNumber}
        companyName={controlData.companyName}
        businessTypeDuringControl={controlData.businessTypeDuringControl}
      />
      {controlType === CONTROL_TYPES.LIC_PAPIER.label && (
        <ControllerControlPictures />
      )}
      <ControllerControlNote />
      <ControllerControlNbCards
        nbAlerts={checkedAlertsNumber || 0}
        onChangeTab={onChangeTab}
      />
    </Stack>
  );
}
