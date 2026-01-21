import React, { useMemo } from "react";
import MenuItem from "@mui/material/MenuItem";
import { makeStyles } from "@mui/styles";
import { formatPersonName } from "common/utils/coworkers";
import { DAY, isoFormatLocalDate } from "common/utils/time";
import { DropdownMenu } from "common/components/DropdownMenu";

const THRESHOLD_30_DAYS = DAY * 30;

const useStyles = makeStyles(() => ({
  menuItem: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "12px 16px",
    height: 68,
    fontFamily: "Marianne, sans-serif",
    borderBottom: "1px solid #CECECE",
    borderRadius: 0,
    "&:last-child": {
      borderBottom: "none"
    },
    "&:hover": {
      backgroundColor: "rgba(0, 0, 0, 0.04)"
    },
    "&:active": {
      backgroundColor: "rgba(0, 0, 0, 0.08)"
    }
  },
  primaryText: {
    fontWeight: 500,
    fontSize: 14,
    lineHeight: "24px",
    color: "#161616"
  },
  secondaryText: {
    fontWeight: 400,
    fontSize: 12,
    lineHeight: "20px",
    color: "#7B7B7B"
  }
}));

function formatLastActiveAt(lastActiveAt) {
  const date = new Date(lastActiveAt);
  const dateStr = date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
  const timeStr = date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
  return `Dernière activité le ${dateStr} à ${timeStr}`;
}

function getInactiveEmployeesToday(employments, workDays) {
  if (!employments?.length) return [];

  const now = Date.now();
  const today = isoFormatLocalDate(new Date());

  // 1. Employees who have activity today (based on workDays)
  const activeUserIdsToday = new Set(
    (workDays || [])
      .filter(wd => wd.day === today && wd.user?.id)
      .map(wd => wd.user.id)
  );

  // 2. Filter inactive employees
  const result = employments
    .filter(emp => {
      if (!emp?.user?.id) return false;
      if (emp.endDate) return false; // Contract ended
      if (emp.dismissedAt) return false; // Employment dismissed
      if (emp.validationStatus !== "approved") return false; // Not approved (pending, rejected, etc.)
      if (!emp.lastActiveAt) return false; // Never had activity
      if (activeUserIdsToday.has(emp.user.id)) return false; // Active today

      // Exclude employees inactive > 30 days
      const lastActiveTimestamp = new Date(emp.lastActiveAt).getTime();
      if (now - lastActiveTimestamp > THRESHOLD_30_DAYS * 1000) return false;

      return true;
    })
    .map(emp => ({
      id: emp.user.id,
      firstName: emp.user.firstName,
      lastName: emp.user.lastName,
      lastActiveAt: emp.lastActiveAt
    }))
    .sort((a, b) => {
      // Sort by lastActiveAt (most recent first)
      if (!a.lastActiveAt && !b.lastActiveAt) return 0;
      if (!a.lastActiveAt) return 1;
      if (!b.lastActiveAt) return -1;
      return new Date(b.lastActiveAt) - new Date(a.lastActiveAt);
    });

  return result;
}

export function InactiveEmployeesDropdown({ employments, workDays }) {
  const classes = useStyles();

  const inactiveEmployees = useMemo(
    () => getInactiveEmployeesToday(employments, workDays),
    [employments, workDays]
  );

  const renderEmployeeItem = (employee, index, { onClick }) => (
    <MenuItem
      key={employee.id}
      className={classes.menuItem}
      onClick={onClick}
      disableRipple
    >
      <span className={classes.primaryText}>
        {formatPersonName(employee, true)}
      </span>
      <span className={classes.secondaryText}>
        {formatLastActiveAt(employee.lastActiveAt)}
      </span>
    </MenuItem>
  );

  return (
    <DropdownMenu
      label="Salariés inactifs aujourd'hui"
      icon="fr-icon-user-search-line"
      items={inactiveEmployees}
      size="medium"
      menuWidth={314}
      emptyMessage="Tous vos salariés ont utilisé Mobilic aujourd'hui"
      renderItem={renderEmployeeItem}
    />
  );
}
