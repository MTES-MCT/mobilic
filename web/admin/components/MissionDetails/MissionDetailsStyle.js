import { makeStyles } from "@mui/styles";
import { fr } from "@codegouvfr/react-dsfr";

export const useMissionDetailsStyles = makeStyles(theme => ({
  missionSubTitle: {
    fontWeight: 200,
    display: "block"
  },
  validationSection: {
    textAlign: "center",
    paddingTop: theme.spacing(5)
  },
  comments: {
    paddingLeft: theme.spacing(3)
  },
  observationSection: {
    flexDirection: "row",
    backgroundColor: theme.palette.background.default
  },
  kilometers: {
    fontSize: 16,
    fontWeight: 500,
    lineHeight: "24px",
    color: fr.colors.decisions.text.title.grey.default
  },
  kilometersValue: {
    fontWeight: 400
  },
  vehicle: {
    flexShrink: 0,
    marginRight: theme.spacing(2)
  },
  employeeCard: {
    width: "100%"
  },
  employeeListItem: {
    "&:not(:first-child)": {
      marginTop: theme.spacing(5)
    }
  },
  validationButton: {
    marginTop: theme.spacing(4)
  },
  adminValidation: {
    textAlign: "left"
  },
  runningMissionText: {
    color: theme.palette.warning.main,
    fontWeight: "bold"
  },
  missionTooLongWarning: {
    marginBottom: theme.spacing(3)
  },
  smallTextButton: {
    fontSize: "0.7rem"
  }
}));
