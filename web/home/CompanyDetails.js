import React from "react";

import { makeStyles } from "@mui/styles";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { useModals } from "common/utils/modals";
import { useAdminStore } from "../admin/store/store";
import { formatPhoneNumber } from "common/utils/phoneNumber";

const useStyles = makeStyles(theme => ({
  actionButton: {
    fontSize: "0.875rem",
    textTransform: "none",
    marginLeft: "2rem"
  },
  phoneNumber: {
    fontSize: "0.875rem",
    fontWeight: 400
  },
  phoneNumberLabel: {
    color: theme.palette.grey[700]
  },
  missingPhoneNumber: {
    color: theme.palette.grey[800]
  }
}));

export default function CompanyDetails({ company }) {
  const classes = useStyles();
  const modals = useModals();
  const adminStore = useAdminStore();

  return (
    <Stack direction="row" justifyContent="flex-start" alignItems="center">
      <Stack direction="column" spacing={1}>
        <Typography variant="h3" component="h1">
          {company?.name}
        </Typography>
        <Typography className={classes.phoneNumber}>
          <span className={classes.phoneNumberLabel}>Numéro de téléphone</span>{" "}
          <span
            className={`${classes.phoneNumberData} ${!company?.phoneNumber &&
              classes.missingPhoneNumber}`}
          >
            {company?.phoneNumber
              ? formatPhoneNumber(company.phoneNumber)
              : "Aucun numéro de téléphone renseigné"}
          </span>
        </Typography>
      </Stack>
      <Button
        size="small"
        color="primary"
        variant="outlined"
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
