import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import Menu from "@mui/material/Menu";
import Box from "@mui/material/Box";
import { makeStyles } from "@mui/styles";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import { Button } from "@codegouvfr/react-dsfr/Button";
import {
  MISSION_STATUS,
  MISSION_STATUS_FILTER_ORDER,
  DEFAULT_VISIBLE_MISSION_STATUSES
} from "../utils/missionsStatus";

const useStyles = makeStyles(() => ({
  menuPaper: {
    padding: "1rem 1.5rem",
    marginTop: "0.25rem",
    minWidth: 260
  },
  resetButton: {
    marginTop: "0.5rem"
  }
}));

export function MissionStatusFilter({ selectedStatuses, onChange }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const activeCount = useMemo(
    () =>
      MISSION_STATUS_FILTER_ORDER.filter(
        (key) =>
          selectedStatuses.includes(key) !==
          DEFAULT_VISIBLE_MISSION_STATUSES.includes(key)
      ).length,
    [selectedStatuses]
  );
  const isActive = activeCount > 0;

  const classes = useStyles();

  const toggleStatus = (key) => {
    if (selectedStatuses.includes(key)) {
      onChange(selectedStatuses.filter((s) => s !== key));
    } else {
      onChange([...selectedStatuses, key]);
    }
  };

  const options = MISSION_STATUS_FILTER_ORDER.map((key) => ({
    label: MISSION_STATUS[key],
    nativeInputProps: {
      checked: selectedStatuses.includes(key),
      onChange: () => toggleStatus(key)
    }
  }));

  return (
    <>
      <Button
        priority="tertiary no outline"
        size="small"
        iconId="fr-icon-filter-line"
        iconPosition="right"
        onClick={(e) => {
          e.stopPropagation();
          setAnchorEl(e.currentTarget);
        }}
        aria-expanded={open}
        aria-haspopup="true"
        title="Filtrer"
      >
        {isActive ? `Filtre (${activeCount})` : "Filtrer"}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        MenuListProps={{ sx: { py: 0 } }}
        slotProps={{ paper: { className: classes.menuPaper } }}
      >
        <Box onClick={(e) => e.stopPropagation()}>
          <Checkbox small options={options} />
          {isActive && (
            <Button
              className={classes.resetButton}
              priority="tertiary no outline"
              size="small"
              iconId="fr-icon-arrow-go-back-line"
              iconPosition="left"
              onClick={() => onChange([...DEFAULT_VISIBLE_MISSION_STATUSES])}
            >
              Annuler les filtres
            </Button>
          )}
        </Box>
      </Menu>
    </>
  );
}

MissionStatusFilter.propTypes = {
  selectedStatuses: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired
};
