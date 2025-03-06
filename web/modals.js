import ConfirmationModal from "./common/Confirmation";
import TeamOrSoloChoiceModal from "./pwa/components/TeamOrSoloChoice";
import EndMissionModal from "./pwa/components/EndMission";
import ApiErrorDialogModal from "./pwa/components/ApiErrorDialog";
import CGUModal from "./landing/cgu";
import UserReadQRCodeModal from "./control/UserReadQRCode";
import UnavailableOfflineModeModal from "./common/UnavailableOfflineMode";
import KilometerReadingModal from "./pwa/components/KilometerReadingModal";
import NewsletterSubscriptionModal from "./landing/NewsletterSubscription";
import GeolocPermissionInfoModal from "./pwa/components/GeolocPermissionInfoModal";
import TypeformModal from "./pwa/components/TypeformModal";
import LogHolidayModal from "./pwa/components/LogHoliday";

// controller
import ControllerHelp from "./controller/components/modals/ControllerHelp";
import ControllerExportC1BAll from "./controller/components/modals/ControllerExportC1BAll";
import ControllerExportC1BOne from "./controller/components/modals/ControllerExportC1BOne";
import ConfirmationCancelControlBulletinModal from "./controller/components/modals/ConfirmationCancelControlBulletinModal";
import ControlPicture from "./controller/components/modals/ControlPicture";

// admin
import UpdateCompanyDetailsModal from "./admin/modals/UpdateCompanyDetailsModal";
import C1BExportModal from "./admin/modals/C1BExportModal";
import ExcelExportModal from "./admin/modals/ExcelExportModal";
import EmployeesTeamRevisionModal from "./admin/modals/EmployeesTeamRevisionModal";
import CompanyTeamCreationRevisionModal from "./admin/modals/CompanyTeamCreationRevisionModal";
import SelectEmployeeModal from "./admin/modals/SelectEmployeeModal";
import TerminateEmploymentModal from "./admin/modals/TerminateEmploymentModal";
import BatchInviteModal from "./admin/modals/BatchInviteModal";

// home
import ChangeEmailModal from "./pwa/modals/ChangeEmailModal";
import ChangeNameModal from "./pwa/modals/ChangeNameModal";
import ChangePhoneNumberModal from "./pwa/modals/ChangePhoneNumberModal";
import ChangeTimezoneModal from "./pwa/modals/ChangeTimezoneModal";

// employee
import FirstActivitySelectionModal from "./pwa/modals/FirstActivitySelectionModal";
import TeamSelectionModal from "./pwa/modals/TeamSelectionModal";
import NewMissionModal from "./pwa/modals/NewMissionModal";
import DriverSelectionModal from "./pwa/modals/DriverSelectionModal";
import CommentInputModal from "./pwa/modals/CommentInputModal";
import ActivityRevisionOrCreationModal from "./pwa/modals/ActivityRevision";
import UpdateVehicleModal from "./pwa/modals/VehicleBookingModal";
import WarningEndMissionModal from "./pwa/modals/WarningEndMissionModal";
import PDFExportModal from "./pwa/modals/PDFExportModal";
import ExpenditureModal from "./pwa/modals/ExpenditureModal";
import BlockedTimeModal from "./pwa/modals/BlockedTimeModal";
import ChangeGenderModal from "./pwa/modals/ChangeGenderModal";

export const MODAL_DICT = {
  firstActivity: FirstActivitySelectionModal,
  teamSelection: TeamSelectionModal,
  confirmation: ConfirmationModal,
  batchInvite: BatchInviteModal,
  newMission: NewMissionModal,
  logHoliday: LogHolidayModal,
  driverSelection: DriverSelectionModal,
  commentInput: CommentInputModal,
  activityRevision: ActivityRevisionOrCreationModal,
  updateVehicle: UpdateVehicleModal,
  dataExport: ExcelExportModal,
  tachographExport: C1BExportModal,
  pdfExport: PDFExportModal,
  teamOrSoloChoice: TeamOrSoloChoiceModal,
  endMission: EndMissionModal,
  expenditures: ExpenditureModal,
  apiErrorDialog: ApiErrorDialogModal,
  cgu: CGUModal,
  changeEmail: ChangeEmailModal,
  changeName: ChangeNameModal,
  changePhoneNumber: ChangePhoneNumberModal,
  changeTimezone: ChangeTimezoneModal,
  changeGender: ChangeGenderModal,
  terminateEmployment: TerminateEmploymentModal,
  userReadQRCode: UserReadQRCodeModal,
  unavailableOfflineMode: UnavailableOfflineModeModal,
  kilometerReading: KilometerReadingModal,
  selectEmployee: SelectEmployeeModal,
  newsletterSubscription: NewsletterSubscriptionModal,
  warningEndMissionModal: WarningEndMissionModal,
  geolocPermissionInfoModal: GeolocPermissionInfoModal,
  controllerExportC1BAll: ControllerExportC1BAll,
  controllerExportC1BOne: ControllerExportC1BOne,
  controllerHelp: ControllerHelp,
  companyTeamCreationRevisionModal: CompanyTeamCreationRevisionModal,
  employeesTeamRevisionModal: EmployeesTeamRevisionModal,
  confirmationCancelControlBulletinModal: ConfirmationCancelControlBulletinModal,
  typeformModal: TypeformModal,
  updateCompanyDetails: UpdateCompanyDetailsModal,
  blockedTime: BlockedTimeModal,
  controlPicture: ControlPicture
};
