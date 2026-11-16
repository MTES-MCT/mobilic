import React, { useState } from "react";
import { makeStyles } from "@mui/styles";
import { AugmentedTable } from "../../components/AugmentedTable";
import { formatPersonName } from "common/utils/coworkers";
import Notice from "../../../common/Notice";
import { useAugmentedTableStyles } from "./useAugmentedTableStyles";
import CollapsibleSectionHeader from "./CollapsibleSectionHeader";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2)
  },
  topSection: {
    display: "flex",
    justifyContent: "space-between",
    gap: theme.spacing(2)
  },
  terminatedEmployment: {
    color: theme.palette.text.disabled
  }
}));

const CurrentEmployeesList = ({
  areThereEmploymentsWithoutBusinessType,
  shouldShowInactiveBanner,
  handleDismissBanner,
  inactiveEmployees,
  handleOpenBatchTerminateModal,
  validEmploymentColumns,
  validEmployments,
  validEmploymentsTableRef,
  containerRef
}) => {
  const classes = useStyles();
  const tableClasses = useAugmentedTableStyles();
  const [open, setOpen] = useState(true);

  return (
    <div className={classes.root}>
      <div className={classes.topSection}>
        <CollapsibleSectionHeader
          label="Salariés"
          open={open}
          onToggle={() => setOpen((value) => !value)}
        />
      </div>
      {areThereEmploymentsWithoutBusinessType && (
        <Notice
          description="Certains salariés n'ont pas de type d'activité de transport
            renseigné. Veuillez en sélectionner un pour chaque salarié actif."
        />
      )}
      {shouldShowInactiveBanner && (
        <Notice
          type="warning"
          onClose={handleDismissBanner}
          description={
            <>
              {formatPersonName(inactiveEmployees[0])} et{" "}
              {inactiveEmployees.length - 1} autres salariés n'ont pas
              enregistré de temps de travail depuis 3 mois. Pensez à détacher
              ces salariés s'ils ne font plus partie de votre entreprise, en
              sélectionnant l'option "détacher", ou{" "}
              <button
                type="button"
                onClick={handleOpenBatchTerminateModal}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  font: "inherit",
                  color: "inherit",
                  textDecoration: "underline",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center"
                }}
              >
                en cliquant ici&nbsp;→
              </button>
            </>
          }
        />
      )}
      {open && (
        <AugmentedTable
          columns={validEmploymentColumns}
          entries={validEmployments}
          virtualizedRowHeight={56}
          className={tableClasses.augmentedTable}
          virtualizedMaxHeight={"100%"}
          ref={validEmploymentsTableRef}
          defaultSortBy="lastName"
          alwaysSortBy={[["isDetached", "asc"]]}
          virtualizedAttachScrollTo={containerRef.current}
          rowClassName={(row) =>
            !row.active ? classes.terminatedEmployment : ""
          }
          virtualized
        />
      )}
    </div>
  );
};

export default CurrentEmployeesList;
