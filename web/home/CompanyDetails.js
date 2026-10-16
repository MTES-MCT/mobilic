import React from "react";
import { makeStyles } from "@mui/styles";
import { useModals } from "common/utils/modals";
import { useAdminStore } from "../admin/store/store";
import { formatPhoneNumber } from "common/utils/phoneNumber";
import { formatActivity } from "common/utils/businessTypes";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useTypographyStyles } from "../common/typography/TypographyStyles";
import { LinkButton } from "../common/LinkButton";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    gap: theme.spacing(2),
    width: "100%",
  },
  mainRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: theme.spacing(2),
    width: "100%",
  },
  companyNameWrapper: {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: theme.spacing(2),
  },
  detailsRow: {
    display: "flex",
    flexDirection: "row",
    gap: theme.spacing(3),
  },
  companyName: {
    ...theme.typography.h3,
    margin: 0,
  },
  fieldRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-end",
    gap: theme.spacing(1),
    ...theme.typography.body1,
  },
  fieldText: {
    fontSize: `${theme.spacing(2)}`,
  },
}));

export default function CompanyDetails({ company }) {
  const classes = useStyles();
  const typographyClasses = useTypographyStyles();
  const modals = useModals();
  const adminStore = useAdminStore();

  const printActivity = React.useMemo(
    () => formatActivity(adminStore.business),
    [adminStore.business],
  );

  return (
    <div className={classes.root}>
      <div className={classes.mainRow}>
        <div className={classes.companyNameWrapper}>
          <h1 className={classes.companyName}>{company?.name}</h1>
          <Button
            size="small"
            priority="tertiary"
            title={`Modifier les informations de l'entreprise ${company?.name}`}
            onClick={() =>
              modals.open("updateCompanyDetailsModal", {
                company,
                adminStore,
              })
            }
          >
            Modifier
          </Button>
        </div>
        <LinkButton
          priority="secondary"
          size="small"
          to="/signup/company"
          style={{ flexShrink: 0 }}
        >
          Inscrire une nouvelle entreprise
        </LinkButton>
      </div>
      <div className={classes.detailsRow}>
        <div className={classes.fieldRow}>
          <span
            className={`${typographyClasses.fieldName} ${classes.fieldText}`}
          >
            Numéro de téléphone
          </span>
          <span
            className={`${!company?.phoneNumber ? typographyClasses.disabled : ""} ${classes.fieldText}`}
          >
            {company?.phoneNumber
              ? formatPhoneNumber(company.phoneNumber)
              : "aucun numéro de téléphone renseigné"}
          </span>
        </div>
        <div className={classes.fieldRow}>
          <span
            className={`${typographyClasses.fieldName} ${classes.fieldText}`}
          >
            Activité principale
          </span>
          <span
            className={`${!printActivity ? typographyClasses.disabled : ""} ${classes.fieldText}`}
          >
            {printActivity || "non renseignée"}
          </span>
        </div>
      </div>
    </div>
  );
}
