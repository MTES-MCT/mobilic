import { FirstActivitySelectionModal } from "./pwa/components/FirstActivitySelection";
import { TeamSelectionModal } from "./pwa/components/TeamSelection";
import { ConfirmationModal } from "./common/Confirmation";
import { MissionSelectionModal } from "./pwa/components/MissionSelection";
import { DriverSelectionModal } from "./pwa/components/DriverSelection";
import { CommentInputModal } from "./pwa/components/CommentInput";
import { ActivityRevisionOrCreationModal } from "./pwa/components/ActivityRevision";
import { VehicleBookingModal } from "./pwa/components/VehicleBooking";
import { DataExport } from "./admin/components/DataExport";

export const MODAL_DICT = {
  firstActivity: FirstActivitySelectionModal,
  teamSelection: TeamSelectionModal,
  confirmation: ConfirmationModal,
  missionSelection: MissionSelectionModal,
  driverSelection: DriverSelectionModal,
  commentInput: CommentInputModal,
  activityRevision: ActivityRevisionOrCreationModal,
  vehicleBooking: VehicleBookingModal,
  dataExport: DataExport
};
