import React, { useState } from "react";
import { makeStyles } from "@mui/styles";
import { fr } from "@codegouvfr/react-dsfr";
import { AugmentedTable } from "../../components/AugmentedTable";
import { useAugmentedTableStyles } from "./useAugmentedTableStyles";
import CollapsibleSectionHeader from "./CollapsibleSectionHeader";
import Notice from "../../../common/Notice";
import { formatPersonName } from "common/utils/coworkers";
import { frenchFormatDateStringOrTimeStamp } from "common/utils/time";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
  },
  terminatedEmployment: {
    color: theme.palette.text.disabled,
  },
  extendLink: {
    marginLeft: theme.spacing(1),
  },
  tooltipOverflow: {
    "& .MuiTableContainer-root": {
      overflowY: "visible !important",
    },
    "& .ReactVirtualized__Table": {
      overflow: "visible !important",
    },
    "& .ReactVirtualized__Grid": {
      overflow: "visible !important",
    },
    "& .ReactVirtualized__Grid__innerScrollContainer": {
      overflow: "visible !important",
    },
    "& .fr-tooltip.fr-placement": {
      zIndex: 1100,
    },
  },
}));

const TemporaryEmployeesSection = ({
  temporaryEmploymentColumns,
  temporaryEmployments,
  temporaryEndingSoon,
  handleUpdateEndDate,
  containerRef,
}) => {
  const classes = useStyles();
  const tableClasses = useAugmentedTableStyles();
  const [open, setOpen] = useState(false);
  const [noticeDismissed, setNoticeDismissed] = useState(false);

  const showNotice = !noticeDismissed && temporaryEndingSoon.length > 0;

  const renderNoticeContent = () => {
    const [first, ...rest] = temporaryEndingSoon;
    if (rest.length === 0) {
      return (
        <>
          {formatPersonName(first)} sera détaché le{" "}
          {frenchFormatDateStringOrTimeStamp(first.endDate)}.
          <button
            type="button"
            className={`${fr.cx("fr-link", "fr-link--sm")} ${classes.extendLink}`}
            onClick={() => handleUpdateEndDate(first)}
          >
            Prolonger le rattachement
          </button>
        </>
      );
    }
    const label =
      rest.length === 1 ? "1 autre salarié" : `${rest.length} autres salariés`;
    return (
      <>
        {formatPersonName(first)} et {label} seront détachés prochainement. Pour
        prolonger un rattachement, cliquez sur
        &laquo;&nbsp;Modifier&nbsp;&raquo; dans la ligne correspondante.
      </>
    );
  };

  return (
    <div className={classes.root}>
      <CollapsibleSectionHeader
        label="Salariés temporaires"
        open={open}
        onToggle={() => setOpen((value) => !value)}
      />
      {open && (
        <>
          {showNotice && (
            <Notice
              type="warning"
              onClose={() => setNoticeDismissed(true)}
              description={renderNoticeContent()}
            />
          )}
          <AugmentedTable
            columns={temporaryEmploymentColumns}
            entries={temporaryEmployments}
            virtualizedRowHeight={56}
            className={`${tableClasses.augmentedTable} ${classes.tooltipOverflow}`}
            virtualizedMaxHeight="100%"
            defaultSortBy="lastName"
            alwaysSortBy={[["isDetached", "asc"]]}
            virtualizedAttachScrollTo={containerRef.current}
            rowClassName={(row) =>
              !row.active ? classes.terminatedEmployment : ""
            }
            virtualized
          />
        </>
      )}
    </div>
  );
};

export default TemporaryEmployeesSection;
