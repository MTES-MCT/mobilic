import React from "react"
import { makeStyles } from "@mui/styles";

import { useSnackbarAlerts } from "../../../common/Snackbar";

import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { fr } from "@codegouvfr/react-dsfr";
import { AugmentedTable } from "../../components/AugmentedTable";


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
  },
  expandBtn: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    cursor: "pointer",
    border: "none",
    background: "none",
    padding: 0,
    font: "inherit",
    color: "inherit",
    textAlign: "left"
  },
  sectionLabel: {
    margin: 0,
    color: fr.colors.decisions.text.title.blueFrance.default,

    fontWeight: 500
  },
  arrowIcon: {
    color: fr.colors.decisions.background.active.blueFrance.default
  },
  augmentedTable: {
    "& .ReactVirtualized__Table__headerRow": {
      backgroundColor: fr.colors.decisions.background.contrastRaised.grey.default,
      borderTop: "none",
      borderBottom: `2px solid ${fr.colors.decisions.border.plain.grey.default}`
    },
    "& .ReactVirtualized__Table__row": {
      borderBottom: `1px solid ${fr.colors.decisions.border.default.grey.default}`
    },
    "& select": {
      borderBottom: "none"
    },
    "& .fr-select-group": {
      marginBottom: 0
    },
    "& .fr-select": {
      boxShadow: "none",
      textOverflow: "ellipsis",
      overflow: "hidden",
      whiteSpace: "nowrap"
    }
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

    return (
      <div className={classes.root}>
        <div className={classes.topSection}>
          <div className={classes.topLeftSection}>
            <h3 className={`${classes.sectionLabel} fr-text--md`}>
              <button
                type="button"
                className={classes.expandBtn}
                onClick={onToggle}
                aria-expanded={open}
              >
                <div
                  className={`fr-icon-arrow-${open ? "down" : "up"}-s-line fr-icon--sm ${classes.arrowIcon}`}
                  aria-hidden="true"
                />
                Invitations en attente
              </button>
            </h3>
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
            className={classes.augmentedTable}
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
