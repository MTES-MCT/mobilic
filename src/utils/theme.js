import { createMuiTheme } from "@material-ui/core/styles";
import red from "@material-ui/core/colors/red";
import green from "@material-ui/core/colors/green";
import cyan from "@material-ui/core/colors/cyan";
import teal from "@material-ui/core/colors/teal";

export const theme = createMuiTheme({
  palette: {
    work: teal[300],
    rest: green[400],
    drive: cyan[500],
    end: red[600]
  }
});
