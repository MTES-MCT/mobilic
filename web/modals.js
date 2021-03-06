import FirstActivitySelectionModal from "./pwa/components/FirstActivitySelection";
import TeamSelectionModal from "./pwa/components/TeamSelection";
import ConfirmationModal from "./common/Confirmation";
import NewMissionModal from "./pwa/components/NewMission";
import DriverSelectionModal from "./pwa/components/DriverSelection";
import CommentInputModal from "./pwa/components/CommentInput";
import ActivityRevisionOrCreationModal from "./pwa/components/ActivityRevision";
import updateVehicleModal from "./pwa/components/VehicleBooking";
import ExcelExport from "./admin/components/ExcelExport";
import C1BExport from "./admin/components/C1BExport";
import TeamOrSoloChoiceModal from "./pwa/components/TeamOrSoloChoice";
import NewTeamMateModal from "./pwa/components/NewTeamMate";
import EndMissionModal from "./pwa/components/EndMission";
import ExpenditureDialogModal from "./pwa/components/ExpenditureDialog";
import ApiErrorDialogModal from "./pwa/components/ApiErrorDialog";
import CGUModal from "./landing/cgu";
import ChangeEmailModal from "./home/ChangeEmail";
import TerminateEmployment from "./admin/components/TerminateEmployment";
import UserReadQRCodeModal from "./control/UserReadQRCode";
import UnavailableOfflineModeModal from "./common/UnavailableOfflineMode";
import KilometerReadingModal from "./pwa/components/KilometerReadingModal";
import SelectEmployeeModal from "./admin/components/SelectEmployee";

export const MODAL_DICT = {
  firstActivity: FirstActivitySelectionModal,
  teamSelection: TeamSelectionModal,
  confirmation: ConfirmationModal,
  newMission: NewMissionModal,
  driverSelection: DriverSelectionModal,
  commentInput: CommentInputModal,
  activityRevision: ActivityRevisionOrCreationModal,
  updateVehicle: updateVehicleModal,
  dataExport: ExcelExport,
  tachographExport: C1BExport,
  teamOrSoloChoice: TeamOrSoloChoiceModal,
  newTeamMate: NewTeamMateModal,
  endMission: EndMissionModal,
  expenditures: ExpenditureDialogModal,
  apiErrorDialog: ApiErrorDialogModal,
  cgu: CGUModal,
  changeEmail: ChangeEmailModal,
  terminateEmployment: TerminateEmployment,
  userReadQRCode: UserReadQRCodeModal,
  unavailableOfflineMode: UnavailableOfflineModeModal,
  kilometerReading: KilometerReadingModal,
  selectEmployee: SelectEmployeeModal
};
