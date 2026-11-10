import React from "react";
import { makeStyles } from "@mui/styles";
import BatchInviteModal from "../../modals/BatchInviteModal";
import InviteSingleEmployeeModal from "../../modals/InviteSingleEmployeeModal";
import CurrentEmployeesCountSection from "./CurrentEmployeesCountSection";
import PendingEmployeesSection from "./PendingEmployeesSection";
import TemporaryEmployeesSection from "./TemporaryEmployeesSection";
import CurrentEmployeesList from "./CurrentEmployeesList";
import { useEmployeesData } from "./useEmployeesData";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    padding: theme.spacing(0)
  },
  title: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  hideButton: {
    marginLeft: theme.spacing(2)
  },
  separator: {
    border: `1px solid ${theme.palette.divider}`,
    padding: 0,
    margin: '2rem 0 1rem 0'
  },
  separatorReducedMarginTop: {
    marginTop: '1rem'
  },
}));

export function Employees({ company, containerRef }) {
  const classes = useStyles();
  const {
    companyId,
    teams,
    setTeams,
    hasClosedInviteModal,
    isLoaded,
    hasMadeInvitations,
    dissmissedBatchInviteCompanyIds,
    batchInvite,
    handleCloseBatchInviteModal,
    employeeProgressData,
    handleBatchInvite,
    handleSingleInvite,
    inviteEmployee,
    singleInviteModalOpen,
    setSingleInviteModalOpen,
    canDisplayPendingEmployments,
    disableRemindAllPendingInvitations,
    sendInvitationsReminders,
    pendingEmployments,
    isLessThanTwelveHoursAgo,
    pendingEmploymentColumns,
    updateValidListScrollPosition,
    setForceUpdate,
    pendingEmploymentsTableRef,
    openPendingTable,
    handleTogglePendingTable,
    areThereEmploymentsWithoutBusinessType,
    shouldShowInactiveBanner,
    handleDismissBanner,
    inactiveEmployees,
    handleOpenBatchTerminateModal,
    validEmploymentColumns,
    validEmploymentsTableRef,
    temporaryEmployments,
    temporaryEndingSoon,
    longTermEmployments,
    temporaryEmploymentColumns,
    handleUpdateEndDate,
    allowTemporaryEmployees,
    adminTeams
  } = useEmployeesData(company);

  return (
    <>
      <InviteSingleEmployeeModal
        open={singleInviteModalOpen}
        handleClose={() => setSingleInviteModalOpen(false)}
        handleSubmit={inviteEmployee}
        allowTemporaryEmployees={allowTemporaryEmployees}
        teams={adminTeams}
      />
      <BatchInviteModal
        open={
          isLoaded &&
          !hasMadeInvitations &&
          !dissmissedBatchInviteCompanyIds.includes(companyId) &&
          !hasClosedInviteModal
        }
        handleClose={handleCloseBatchInviteModal}
        handleSubmit={batchInvite}
        isNewAdmin={true}
      />
      <div className={classes.root}>
        <CurrentEmployeesCountSection
          teams={teams}
          setTeams={setTeams}
          employeesData={employeeProgressData}
          handleBatchInvite={handleBatchInvite}
          handleSingleInvite={handleSingleInvite}
          hasMadeInvitations={hasMadeInvitations}
        />
        <div className={classes.separator}/>
        {
          canDisplayPendingEmployments &&
          <PendingEmployeesSection
            disableRemindAllPendingInvitations={disableRemindAllPendingInvitations}
            sendInvitationsReminders={sendInvitationsReminders}
            pendingEmployments={pendingEmployments}
            isLessThanTwelveHoursAgo={isLessThanTwelveHoursAgo}
            pendingEmploymentColumns={pendingEmploymentColumns}
            updateValidListScrollPosition={updateValidListScrollPosition}
            setForceUpdate={setForceUpdate}
            pendingEmploymentsTableRef={pendingEmploymentsTableRef}
            containerRef={containerRef}
            open={openPendingTable}
            onToggle={handleTogglePendingTable}
          />
        }
        {temporaryEmployments.length > 0 && (
          <>
            <div
              className={`${classes.separator} ${classes.separatorReducedMarginTop}`}
            />
            <TemporaryEmployeesSection
              temporaryEmploymentColumns={temporaryEmploymentColumns}
              temporaryEmployments={temporaryEmployments}
              temporaryEndingSoon={temporaryEndingSoon}
              handleUpdateEndDate={handleUpdateEndDate}
              containerRef={containerRef}
            />
          </>
        )}
        <div
          className={`${classes.separator} ${classes.separatorReducedMarginTop}`}
        />
        <CurrentEmployeesList
          areThereEmploymentsWithoutBusinessType={areThereEmploymentsWithoutBusinessType}
          shouldShowInactiveBanner={shouldShowInactiveBanner}
          handleDismissBanner={handleDismissBanner}
          inactiveEmployees={inactiveEmployees}
          handleOpenBatchTerminateModal={handleOpenBatchTerminateModal}
          validEmploymentColumns={validEmploymentColumns}
          validEmployments={longTermEmployments}
          validEmploymentsTableRef={validEmploymentsTableRef}
          containerRef={containerRef}
          label={temporaryEmployments.length > 0 ? "Salariés longue durée" : undefined}
        />
      </div>
    </>
  );
}
