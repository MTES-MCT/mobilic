import React, { useState, useMemo } from "react";
import MenuItem from "@mui/material/MenuItem";
import { makeStyles } from "@mui/styles";
import { formatPersonName } from "common/utils/coworkers";
import {
  DAY,
  isoFormatLocalDate,
  unixToJSTimestamp
} from "common/utils/time";
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
    cursor: "default",
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
  const date = new Date(unixToJSTimestamp(lastActiveAt));
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

  const activeUserIdsToday = new Set();
  if (workDays) {
    for (const wd of workDays) {
      if (wd.day === today && wd.user?.id) {
        activeUserIdsToday.add(wd.user.id);
      }
    }
  }

  const results = [];
  
  // Single pass through employments with early returns
  for (const emp of employments) {
    // Quick rejections first (cheapest checks)
    if (!emp?.user?.id) continue;
    if (activeUserIdsToday.has(emp.user.id)) continue;
    if (emp.validationStatus !== "approved") continue;
    if (!emp.lastActiveAt) continue;
    
    // More expensive checks
    if (emp.endDate && emp.endDate < today) continue;
    
    const lastActiveTimestampMs = unixToJSTimestamp(emp.lastActiveAt);
    if (now - lastActiveTimestampMs > THRESHOLD_30_DAYS * 1000) continue;

    results.push({
      id: emp.user.id,
      firstName: emp.user.firstName,
      lastName: emp.user.lastName,
      lastActiveAt: emp.lastActiveAt
    });
  }

  // Sort by lastActiveAt descending (most recent first)
  results.sort((a, b) => {
    if (!a.lastActiveAt && !b.lastActiveAt) return 0;
    if (!a.lastActiveAt) return 1;
    if (!b.lastActiveAt) return -1;
    return b.lastActiveAt - a.lastActiveAt;
  });

  return results;
}

export function InactiveEmployeesDropdown({ employments, workDays }) {
  const classes = useStyles();
  const [isOpen, setIsOpen] = useState(false);

  // Only compute inactive employees when dropdown is opened to avoid expensive
  // calculations on every render (can be 10k+ operations for large companies)
  // We use a lazy initialization pattern: compute only when isOpen becomes true
  const inactiveEmployees = useMemo(() => {
    if (!isOpen) {
      // Return empty array without any computation when closed
      return [];
    }
    return getInactiveEmployeesToday(employments, workDays);
  }, [isOpen, employments, workDays]);

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
      size="small"
      menuWidth={inactiveEmployees.length > 0 ? 314 : undefined}
      maxHeight={220}
      emptyMessage="Tous vos salariés ont utilisé Mobilic"
      renderItem={renderEmployeeItem}
      onOpenChange={setIsOpen}
    />
  );
}
