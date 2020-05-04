import { FirstActivitySelectionModal } from "./pwa/components/FirstActivitySelection";
import { TeamSelectionModal } from "./pwa/components/TeamSelection";
import { ConfirmationModal } from "./common/Confirmation";
import { NewMissionModal } from "./pwa/components/NewMission";
import { DriverSelectionModal } from "./pwa/components/DriverSelection";
import { CommentInputModal } from "./pwa/components/CommentInput";
import { ActivityRevisionOrCreationModal } from "./pwa/components/ActivityRevision";
import { VehicleBookingModal } from "./pwa/components/VehicleBooking";
import { DataExport } from "./admin/components/DataExport";
import {TeamOrSoloChoiceModal} from "./pwa/components/TeamOrSoloChoice";
import {NewTeamMateModal} from "./pwa/components/NewTeamMate";

export const MODAL_DICT = {
  firstActivity: FirstActivitySelectionModal,
  teamSelection: TeamSelectionModal,
  confirmation: ConfirmationModal,
  newMission: NewMissionModal,
  driverSelection: DriverSelectionModal,
  commentInput: CommentInputModal,
  activityRevision: ActivityRevisionOrCreationModal,
  vehicleBooking: VehicleBookingModal,
  dataExport: DataExport,
  teamOrSoloChoice: TeamOrSoloChoiceModal,
  newTeamMate: NewTeamMateModal
};
