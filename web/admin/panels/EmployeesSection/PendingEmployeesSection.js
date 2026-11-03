import React from "react"
import { makeStyles } from "@mui/styles";

import { useSnackbarAlerts } from "../../../common/Snackbar";

import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { AugmentedTable } from "../../components/AugmentedTable";
import { useAugmentedTableStyles } from "./useAugmentedTableStyles";
import CollapsibleSectionHeader from "./CollapsibleSectionHeader";


const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2)
  },
  topSection: {
    display: "flex",
    justifyContent: "space-between",
    gap: theme.spacing(2),
  },
  topLeftSection: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(1),
  }
}));

const PendingEmployeesSection = ({
  disableRemindAllPendingInvitations,
  sendInvitationsReminders,
  pendingEmployments,
  isLessThanTwelveHoursAgo,
  pendingEmploymentColumns,
  updateValidListScrollPosition,
  setForceUpdate,
  pendingEmploymentsTableRef,
  containerRef,
  open,
  onToggle,
  onRowAdd
}) => {
    const alerts = useSnackbarAlerts();
    const classes = useStyles();
    const tableClasses = useAugmentedTableStyles();

    return (
      <div className={classes.root}>
        <div className={classes.topSection}>
          <div className={classes.topLeftSection}>
            <CollapsibleSectionHeader
              label="Invitations en attente"
              open={open}
              onToggle={onToggle}
            />
            <Badge
              severity="new"
              noIcon="true"
            >
                {pendingEmployments.length}
            </Badge>
          </div>
          <Button
            priority="tertiary no outline"
            size="small"
            iconPosition="left"
            iconId="fr-icon-arrow-go-forward-fill"
            disabled={disableRemindAllPendingInvitations}
            onClick={async () => {
            await alerts.withApiErrorHandling(async () =>
              sendInvitationsReminders(
                pendingEmployments
                  .filter(
                    (e) =>
                        !e.latestInviteEmailTime ||
                        !isLessThanTwelveHoursAgo(e.latestInviteEmailTime)
                    )
                    .map((e) => e.id)
                )
              );
            }}
          >
            Relancer les invitations
          </Button>
        </div>
        {
          open &&
          <AugmentedTable
            columns={pendingEmploymentColumns}
            entries={pendingEmployments}
            ref={pendingEmploymentsTableRef}
            onScroll={updateValidListScrollPosition}
            dense
            className={tableClasses.augmentedTable}
            validateRow={({ idOrEmail, hasAdminRights }) =>
              !!idOrEmail && !!hasAdminRights
            }
            forceParentUpdateOnRowAdd={() =>
              setForceUpdate((value) => !value)
            }
            editActionsColumnMinWidth={180}
            defaultSortBy={"creationDate"}
            defaultSortType={"desc"}
            virtualized
            virtualizedRowHeight={56}
            virtualizedMaxHeight={"100%"}
            virtualizedAttachScrollTo={containerRef.current}
            onRowAdd={onRowAdd}
          />
        }
      </div>
    )
}

export default PendingEmployeesSection
