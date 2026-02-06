// DSFR "Menu déroulant" (beta): https://www.systeme-de-design.gouv.fr/composants-et-modeles/composants-beta/menu-deroulant
import React, { useState, useCallback } from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { makeStyles } from "@mui/styles";

const SIZES = {
  small: {
    height: "2rem",
    fontSize: "0.875rem",
    lineHeight: "1.5rem",
    gap: "0.25rem",
    padding: "0.25rem 0.5rem",
    iconSize: "fr-icon--sm"
  },
  medium: {
    height: "2.5rem",
    fontSize: "1rem",
    lineHeight: "1.5rem",
    gap: "0.5rem",
    padding: "0.5rem 0.75rem",
    iconSize: "fr-icon--md"
  },
  large: {
    height: "3rem",
    fontSize: "1.125rem",
    lineHeight: "1.75rem",
    gap: "0.5rem",
    padding: "0.75rem 1rem",
    iconSize: "fr-icon--lg"
  }
};

const DSFR_COLORS = {
  textDefault: "#000091",
  textDisabled: "#929292",
  backgroundHover: "rgba(0, 0, 0, 0.04)",
  backgroundActive: "rgba(0, 0, 0, 0.08)",
  backgroundOpen: "#E3E3FD",
  borderOpen: "#DDDDDD",
  focusOutline: "#0A76F6",
  menuBackground: "#FFFFFF",
  menuBorderTop: "#E3E3FD",
  menuShadow: "0px 4px 12px rgba(0, 0, 18, 0.16)",
  itemBorder: "#DDDDDD"
};

const useStyles = makeStyles(() => ({
  triggerButton: ({ size, disabled }) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: SIZES[size].gap,
    padding: SIZES[size].padding,
    height: SIZES[size].height,
    background: "transparent",
    border: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "Marianne, sans-serif",
    fontSize: SIZES[size].fontSize,
    fontWeight: 500,
    lineHeight: SIZES[size].lineHeight,
    color: disabled ? DSFR_COLORS.textDisabled : DSFR_COLORS.textDefault,
    "&:hover:not(:disabled)": {
      backgroundColor: DSFR_COLORS.backgroundHover
    },
    "&:active:not(:disabled)": {
      backgroundColor: DSFR_COLORS.backgroundActive
    },
    "&:focus-visible": {
      outline: `2px solid ${DSFR_COLORS.focusOutline}`,
      outlineOffset: 2
    }
  }),
  triggerButtonOpen: {
    backgroundColor: DSFR_COLORS.backgroundOpen,
    border: `1px solid ${DSFR_COLORS.borderOpen}`
  },
  menuPaper: ({ menuWidth }) => ({
    width: menuWidth || 282,
    maxHeight: 430,
    marginTop: 0,
    background: DSFR_COLORS.menuBackground,
    borderTop: `1px solid ${DSFR_COLORS.menuBorderTop}`,
    boxShadow: DSFR_COLORS.menuShadow,
    borderRadius: 0
  }),
  menuList: {
    padding: 0
  },
  menuItem: ({ size }) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    padding: SIZES[size].padding,
    minHeight: SIZES[size].height,
    fontFamily: "Marianne, sans-serif",
    fontSize: SIZES[size].fontSize,
    lineHeight: SIZES[size].lineHeight,
    borderBottom: `1px solid ${DSFR_COLORS.itemBorder}`,
    "&:last-child": {
      borderBottom: "none"
    },
    "&:hover": {
      backgroundColor: DSFR_COLORS.backgroundHover
    },
    "&:active": {
      backgroundColor: DSFR_COLORS.backgroundActive
    },
    "&.Mui-disabled": {
      color: DSFR_COLORS.textDisabled,
      opacity: 1
    }
  }),
  menuItemPrimary: {
    fontWeight: 500,
    color: DSFR_COLORS.textDefault
  },
  menuItemSecondary: {
    fontSize: 12,
    lineHeight: "20px",
    color: "#666666"
  }
}));

export function DropdownMenu({
  label,
  icon,
  items,
  size = "sm",
  disabled = false,
  menuWidth,
  emptyMessage,
  onItemClick,
  renderItem
}) {
  const classes = useStyles({ size, disabled, menuWidth });
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleOpen = useCallback(
    event => {
      if (!disabled) {
        setAnchorEl(event.currentTarget);
      }
    },
    [disabled]
  );

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleItemClick = useCallback(
    (item, index) => {
      if (onItemClick) {
        onItemClick(item, index);
      }
      handleClose();
    },
    [onItemClick, handleClose]
  );

  const sizeConfig = SIZES[size];

  return (
    <>
      <button
        type="button"
        className={`${classes.triggerButton} ${open ? classes.triggerButtonOpen : ""}`}
        onClick={handleOpen}
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {icon && (
          <span
            className={`${icon} ${sizeConfig.iconSize}`}
            aria-hidden="true"
          />
        )}
        <span>{label}</span>
        <span
          className={`${open ? "fr-icon-arrow-up-s-line" : "fr-icon-arrow-down-s-line"} ${sizeConfig.iconSize}`}
          aria-hidden="true"
        />
      </button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        PaperProps={{ className: classes.menuPaper }}
        MenuListProps={{ className: classes.menuList }}
      >
        {items.length === 0 && emptyMessage ? (
          <MenuItem disabled className={classes.menuItem}>
            <span className={classes.menuItemPrimary}>{emptyMessage}</span>
          </MenuItem>
        ) : (
          items.map((item, index) =>
            renderItem ? (
              renderItem(item, index, {
                classes,
                onClick: () => handleItemClick(item, index),
                onClose: handleClose
              })
            ) : (
              <MenuItem
                key={item.id || index}
                className={classes.menuItem}
                onClick={() => handleItemClick(item, index)}
                disabled={item.disabled}
                disableRipple
              >
                <span className={classes.menuItemPrimary}>{item.label}</span>
                {item.description && (
                  <span className={classes.menuItemSecondary}>
                    {item.description}
                  </span>
                )}
              </MenuItem>
            )
          )
        )}
      </Menu>
    </>
  );
}

export { SIZES as DROPDOWN_MENU_SIZES, DSFR_COLORS };
