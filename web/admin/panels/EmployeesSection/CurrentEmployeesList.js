import React, { useState } from "react";
import { makeStyles } from "@mui/styles";
import { fr } from "@codegouvfr/react-dsfr";
import { AugmentedTable } from "../../components/AugmentedTable";
import { formatPersonName } from "common/utils/coworkers";
import Notice from "../../../common/Notice";

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
  const [open, setOpen] = useState(true);

  return (
    <div className={classes.root}>
      <div className={classes.topSection}>
        <h3 className={`${classes.sectionLabel} fr-text--md`}>
          <button
            type="button"
            className={classes.expandBtn}
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
          >
            <div
              className={`fr-icon-arrow-${open ? "down" : "up"}-s-line fr-icon--sm ${classes.arrowIcon}`}
              aria-hidden="true"
            />
            Salariés
          </button>
        </h3>
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
          className={classes.augmentedTable}
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
