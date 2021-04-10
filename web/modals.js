import React from "react";

export const MODAL_DICT = {
  firstActivity: React.lazy(() =>
    import("./pwa/components/FirstActivitySelection")
  ),
  teamSelection: React.lazy(() => import("./pwa/components/TeamSelection")),
  confirmation: React.lazy(() => import("./common/Confirmation")),
  newMission: React.lazy(() => import("./pwa/components/NewMission")),
  driverSelection: React.lazy(() => import("./pwa/components/DriverSelection")),
  commentInput: React.lazy(() => import("./pwa/components/CommentInput")),
  activityRevision: React.lazy(() =>
    import("./pwa/components/ActivityRevision")
  ),
  vehicleBooking: React.lazy(() => import("./pwa/components/VehicleBooking")),
  dataExport: React.lazy(() => import("./admin/components/DataExport")),
  teamOrSoloChoice: React.lazy(() =>
    import("./pwa/components/TeamOrSoloChoice")
  ),
  newTeamMate: React.lazy(() => import("./pwa/components/NewTeamMate")),
  endMission: React.lazy(() => import("./pwa/components/EndMission")),
  expenditures: React.lazy(() => import("./pwa/components/ExpenditureDialog")),
  apiErrorDialog: React.lazy(() => import("./pwa/components/ApiErrorDialog")),
  cgu: React.lazy(() => import("./landing/cgu")),
  changeEmail: React.lazy(() => import("./home/ChangeEmail")),
  terminateEmployment: React.lazy(() =>
    import("./admin/components/TerminateEmployment")
  ),
  userReadQRCode: React.lazy(() => import("./control/UserReadQRCode"))
};
