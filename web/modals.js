import FirstActivitySelectionModal from "./pwa/components/FirstActivitySelection";
import TeamSelectionModal from "./pwa/components/TeamSelection";
import ConfirmationModal from "./common/Confirmation";
import NewMissionModal from "./pwa/components/NewMission";
import DriverSelectionModal from "./pwa/components/DriverSelection";
import CommentInputModal from "./pwa/components/CommentInput";
import ActivityRevisionOrCreationModal from "./pwa/components/ActivityRevision/ActivityRevision";
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
import ChangeTimezoneModal from "./home/ChangeTimezone";
import TerminateEmployment from "./admin/components/TerminateEmployment";
import UserReadQRCodeModal from "./control/UserReadQRCode";
import UnavailableOfflineModeModal from "./common/UnavailableOfflineMode";
import KilometerReadingModal from "./pwa/components/KilometerReadingModal";
import SelectEmployeeModal from "./admin/components/SelectEmployee";
import PDFExport from "./pwa/components/PDFExport";
import BatchInvite from "./admin/components/BatchInvite";
import WarningEndMissionModal from "./pwa/components/WarningEndMissionModal/WarningEndMissionModal";
import NewsletterSubscriptionModal from "./landing/NewsletterSubscription";
import GeolocPermissionInfoModal from "./pwa/components/GeolocPermissionInfoModal";
import ControllerHelp from "./controller/components/modals/ControllerHelp";
import ControllerExportC1BAll from "./controller/components/modals/ControllerExportC1BAll";
import ChangeNameModal from "./home/ChangeName";
import CompanyTeamCreationRevisionModal from "./admin/panels/CompanyTeamCreationRevisionModal";
import EmployeesTeamRevisionModal from "./admin/panels/EmployeesTeamRevisionModal";
import ConfirmationCancelControlBulletinModal from "./controller/components/controlBulletin/ConfirmationCancelControlBulletinModal";
import TypeformModal from "./pwa/components/TypeformModal";
import LogHolidayModal from "./pwa/components/LogHoliday";

export const MODAL_DICT = {
  firstActivity: FirstActivitySelectionModal,
  teamSelection: TeamSelectionModal,
  confirmation: ConfirmationModal,
  batchInvite: BatchInvite,
  newMission: NewMissionModal,
  logHoliday: LogHolidayModal,
  driverSelection: DriverSelectionModal,
  commentInput: CommentInputModal,
  activityRevision: ActivityRevisionOrCreationModal,
  updateVehicle: updateVehicleModal,
  dataExport: ExcelExport,
  tachographExport: C1BExport,
  pdfExport: PDFExport,
  teamOrSoloChoice: TeamOrSoloChoiceModal,
  newTeamMate: NewTeamMateModal,
  endMission: EndMissionModal,
  expenditures: ExpenditureDialogModal,
  apiErrorDialog: ApiErrorDialogModal,
  cgu: CGUModal,
  changeEmail: ChangeEmailModal,
  changeName: ChangeNameModal,
  changeTimezone: ChangeTimezoneModal,
  terminateEmployment: TerminateEmployment,
  userReadQRCode: UserReadQRCodeModal,
  unavailableOfflineMode: UnavailableOfflineModeModal,
  kilometerReading: KilometerReadingModal,
  selectEmployee: SelectEmployeeModal,
  newsletterSubscription: NewsletterSubscriptionModal,
  warningEndMissionModal: WarningEndMissionModal,
  geolocPermissionInfoModal: GeolocPermissionInfoModal,
  controllerExportC1BAll: ControllerExportC1BAll,
  controllerHelp: ControllerHelp,
  companyTeamCreationRevisionModal: CompanyTeamCreationRevisionModal,
  employeesTeamRevisionModal: EmployeesTeamRevisionModal,
  confirmationCancelControlBulletinModal: ConfirmationCancelControlBulletinModal,
  typeformModal: TypeformModal
};
