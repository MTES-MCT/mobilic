import React from "react";
import { makeStyles } from "@mui/styles";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import { fr } from "@codegouvfr/react-dsfr";

const useStyles = makeStyles(theme => ({
  closeNavButton: {
    display: "flex",
    justifyContent: "flex-end"
  },
  navDrawer: {
    minWidth: 200
  }
}));

export function Navigation({ open, setOpen, children }) {
  const classes = useStyles();

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={() => setOpen(false)}
      PaperProps={{ className: classes.navDrawer }}
    >
      <Box className={classes.closeNavButton} pt={2} mr={2} mb={4}>
        <button
          className={fr.cx("fr-btn--close", "fr-btn")}
          type="button"
          onClick={() => setOpen(false)}
          title="Fermer la fenêtre modale"
        >
          Fermer
        </button>
      </Box>
      {children}
    </Drawer>
  );
}
