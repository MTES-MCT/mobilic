import { createTheme, responsiveFontSizes } from "@mui/material/styles";

export const customOptions = {
  components: {
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          "&.Mui-focusVisible": {
            backgroundColor: "transparent"
          }
        }
      }
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          "&.Mui-focusVisible": {
            backgroundColor: "transparent"
          }
        }
      }
    }
    //   MuiLink: {
    //     defaultProps: {
    //       underline: "always"
    //     }
    //   },
    // MuiButton: {
    //   styleOverrides: {
    //     root: {
    //       borderRadius: "20px"
    //     }
    //   }
    // },
    //   MuiTableSortLabel: {
    //     styleOverrides: {
    //       icon: {
    //         opacity: 0.3
    //       }
    //     }
    //   }
  },
  palette: {
    primary: {
      main: "#3965EA",
      light: "#DAE9FF",
      lighter: "#F4F8FF",
      dark: "#202DA7"
    },
    warning: {
      light: "#b34000", // warning-425-625-active en mode clair
      main: "#b34000", // warning-425-625 en mode clair
      dark: "#ff6218", // warning-425-625-hover en mode clair
      contrastText: "#fff" // Blanc pour contraste sur warning
    }
  },
  typography: {
    fontFamily: '"Marianne", Arial, sans-serif',
    h1: {
      fontSize: "2em",
      fontWeight: "bold"
    },
    h2: {
      fontSize: "1.75em",
      fontWeight: "bold"
    },
    h3: {
      fontSize: "1.5em",
      fontWeight: "bold"
    },
    h4: {
      fontSize: "1.25em",
      fontWeight: "bold"
    },
    h5: {
      fontSize: "1.125em",
      fontWeight: "bold"
    },
    h6: {
      fontSize: "1em",
      fontWeight: "bold"
    }
  },
  zIndex: {
    modal: 2000
  }
};

export const theme = responsiveFontSizes(createTheme(customOptions));
