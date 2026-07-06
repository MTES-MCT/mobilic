import React from "react";
import { makeStyles } from "@mui/styles";
import { Link } from "./LinkButton";
import MobilicLogoWithText from "common/assets/images/mobilic-logo-with-text.svg";
import MarianneLogo from "common/assets/images/marianne.svg";

const useStyles = makeStyles((theme) => ({
    header: {
        zIndex: 1000,
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        alignItems: "center",
        boxShadow: "0 1px 3px rgba(0, 0, 18, 0.16)",
    },
    logoSection: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: "2rem",
        cursor: "pointer",
        textDecoration: "none",
        "& img": {
          height: "4rem",
        }
    },
    burgerIcon: {
      padding: "0.5rem",
      backgroundColor: "transparent",
      color: "var(--text-action-high-blue-france)",
      border: "1px solid var(--border-default-grey)",
      cursor: "pointer",
    }
}));


export const MobileHeaderConnected = ({ openNavigationMenu, homePath, open, disableMenu = false }) => {
  const classes = useStyles();

  return (
    <header className={`${classes.header} fr-header fr-px-2w fr-py-2w`}>
      <Link to={homePath} className={classes.logoSection} underline="none">
        <img src={MarianneLogo} alt="Marianne" />
        <img src={MobilicLogoWithText} alt="Mobilic" />
      </Link>
      {!disableMenu && (
        <button
          onClick={openNavigationMenu}
          className={classes.burgerIcon}
          aria-expanded={open}
          aria-controls="navigation-drawer"
          aria-haspopup="dialog"
        >
          <span className="fr-icon-menu-fill" aria-label="Menu" title="Menu"></span>
        </button>
      )}
    </header>
  )
}