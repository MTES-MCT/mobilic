import React from "react";

import { makeStyles } from "@mui/styles";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { useModals } from "common/utils/modals";
import { useAdminStore } from "../admin/store/store";
import { formatPhoneNumber } from "common/utils/phoneNumber";
import { formatActivity } from "common/utils/businessTypes";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useTypographyStyles } from "../common/typography/TypographyStyles";

const useStyles = makeStyles(theme => ({
  actionButton: {
    marginLeft: "2rem"
  },
  phoneNumberData: {
    color: "black"
  }
}));

export default function CompanyDetails({ company }) {
  const classes = useStyles();
  const typographyClasses = useTypographyStyles();
  const modals = useModals();
  const adminStore = useAdminStore();

  const printActivity = React.useMemo(
    () => formatActivity(adminStore.business),
    [adminStore.business]
  );

  return (
    <Stack direction="row" justifyContent="flex-start" alignItems="flex-start">
      <Stack direction="column">
        <Typography variant="h3" component="h1" sx={{ marginBottom: 1 }}>
          {company?.name}
        </Typography>
        <Typography className={typographyClasses.fieldName}>
          <span>Numéro de téléphone :</span>{" "}
          <span
            className={
              !company?.phoneNumber
                ? typographyClasses.disabled
                : classes.phoneNumberData
            }
          >
            {company?.phoneNumber
              ? formatPhoneNumber(company.phoneNumber)
              : "aucun numéro de téléphone renseigné"}
          </span>
        </Typography>
        <Typography className={typographyClasses.fieldName}>
          <span>Activité principale :</span>{" "}
          <span
            className={
              !printActivity
                ? typographyClasses.disabled
                : classes.phoneNumberData
            }
          >
            {printActivity || "non renseignée"}
          </span>
        </Typography>
      </Stack>
      <Button
        size="small"
        priority="tertiary"
        title={`Modifier les informations de l'entreprise ${company?.name}`}
        onClick={() =>
          modals.open("updateCompanyDetails", {
            company,
            adminStore
          })
        }
        className={classes.actionButton}
      >
        Modifier
      </Button>
    </Stack>
  );
}
