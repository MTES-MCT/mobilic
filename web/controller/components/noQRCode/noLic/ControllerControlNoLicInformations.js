import React from "react";

import Stack from "@mui/material/Stack";
import { useControl } from "../../../utils/contextControl";
import { ControllerControlEmployeeInfo } from "../../details/ControllerControlEmployeeInfo";
import { ControllerControlMissionInfo } from "../../details/ControllerControlMissionInfo";
import { ControllerControlNote } from "../../details/ControllerControlNote";
import { ControllerControlNbCards } from "../../details/ControllerControlNbCard";
import { useInfractions } from "../../../utils/contextInfractions";

export function ControllerControlNoLicInformations({ onChangeTab }) {
  const { controlData } = useControl();
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
      <ControllerControlNote />
      <ControllerControlNbCards
        nbAlerts={checkedAlertsNumber || 0}
        onChangeTab={onChangeTab}
      />
    </Stack>
  );
}
