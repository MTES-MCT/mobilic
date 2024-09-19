import { createTheme, responsiveFontSizes } from "@mui/material/styles";
import { red } from "@mui/material/colors";

export const customOptions = {
  components: {
    MuiLink: {
      defaultProps: {
        underline: "always"
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "20px"
        }
      }
    },
    MuiTableSortLabel: {
      styleOverrides: {
        icon: {
          opacity: 0.3
        }
      }
    }
  },
  palette: {
    work: "#F3A817",
    break: "#9A9CF8",
    drive: "#6BE670",
    transfer: "#417DC4",
    rest: red[600],
    primary: {
      main: "#3284FF",
      light: "#006be6",
      lighter: "#b4e1fa",
      dark: "#0053b3"
    },
    background: {
      default: "#f7f9fa",
      paper: "#fff",
      dark: "#26353f"
    },
    text: {
      primary: "#26353f"
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
