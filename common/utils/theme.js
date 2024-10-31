import { fr } from "@codegouvfr/react-dsfr";
import { createTheme, responsiveFontSizes } from "@mui/material/styles";

export const customOptions = {
  // components: {
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
  // },
  palette: {
    primary: {
      main: "#3965EA",
      light: "#DAE9FF",
      lighter: "#F4F8FF",
      dark: "#202DA7"
    },
    warning: {
      light: fr.colors.options.warning._425_625.default,
      main: fr.colors.options.warning._425_625.default,
      dark: fr.colors.options.warning._425_625.hover,
      contrastText: fr.colors.options.grey._1000_50.default
    }
    // background: {
    //   default: "#f7f9fa",
    //   paper: "#fff",
    //   dark: "#26353f"
    // },
    // text: {
    //   primary: "#26353f"
    // }
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
