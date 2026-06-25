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
    display: "flex",
    flexDirection: "column"
  },
  observationSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.palette.background.default,
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(5)
  },
  addEmployeeButton: {
    marginBottom: theme.spacing(5)
  },
  separator: {
    height: 1,
    alignSelf: "stretch",
    background: fr.colors.decisions.border.default.grey.default,
    marginBottom: theme.spacing(5)
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
  employeeList: {
    paddingTop: 0
  },
  employeeCard: {
    width: "100%"
  },
  employeeListItem: {
    paddingTop: 0,
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
