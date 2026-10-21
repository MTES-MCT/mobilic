import React from "react";
import { makeStyles } from "@mui/styles";
import BatchInviteModal from "../../modals/BatchInviteModal";
import CurrentEmployeesCountSection from "./CurrentEmployeesCountSection";
import PendingEmployeesSection from "./PendingEmployeesSection";
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
  separatorNoMarginTop: {
    marginTop: 0
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
    handlePendingRowAdd,
    areThereEmploymentsWithoutBusinessType,
    shouldShowInactiveBanner,
    handleDismissBanner,
    inactiveEmployees,
    handleOpenBatchTerminateModal,
    validEmploymentColumns,
    validEmployments,
    validEmploymentsTableRef
  } = useEmployeesData(company);

  return (
    <>
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
            onRowAdd={handlePendingRowAdd}
          />
        }
        <div
          className={`${classes.separator} ${classes.separatorNoMarginTop}`}
        />
        <CurrentEmployeesList
          areThereEmploymentsWithoutBusinessType={areThereEmploymentsWithoutBusinessType}
          shouldShowInactiveBanner={shouldShowInactiveBanner}
          handleDismissBanner={handleDismissBanner}
          inactiveEmployees={inactiveEmployees}
          handleOpenBatchTerminateModal={handleOpenBatchTerminateModal}
          validEmploymentColumns={validEmploymentColumns}
          validEmployments={validEmployments}
          validEmploymentsTableRef={validEmploymentsTableRef}
          containerRef={containerRef}
        />
      </div>
    </>
  );
}
