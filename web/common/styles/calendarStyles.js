import { makeStyles } from "@mui/styles";
import { fr } from "@codegouvfr/react-dsfr";

export const useCalendarStyles = makeStyles(theme => ({
  calendar: {
    border: "1px solid",
    borderColor: fr.colors.decisions.background.disabled.grey.default,
    borderRadius: "0px",
    boxShadow: "none"
  }
}));
