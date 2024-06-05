import React from "react";

import { useApi } from "common/utils/api";

import {
  Button,
  Modal,
  ModalContent,
  ModalFooter,
  ModalTitle,
  TextInput
} from "@dataesr/react-dsfr";
import { makeStyles } from "@mui/styles";
import { PhoneNumber } from "../../common/PhoneNumber";
import { UPDATE_COMPANY_DETAILS } from "common/utils/apiQueries";
import { ADMIN_ACTIONS } from "../store/reducers/root";
import Stack from "@mui/material/Stack";
import { useSnackbarAlerts } from "../../common/Snackbar";

const useStyles = makeStyles(theme => ({
  label: {
    textAlign: "left"
  }
}));

export default function UpdateCompanyDetailsModal({
  open,
  handleClose,
  company,
  adminStore
}) {
  const classes = useStyles();
  const api = useApi();
  const alerts = useSnackbarAlerts();

  const [newCompanyName, setNewCompanyName] = React.useState(company?.name);
  const [newCompanyPhoneNumber, setNewCompanyPhoneNumber] = React.useState(
    company?.phoneNumber
  );

  const canSave = React.useMemo(
    () =>
      newCompanyName &&
      (newCompanyName !== company?.name ||
        newCompanyPhoneNumber !== company?.phoneNumber),
    [company?.phoneNumber, company?.name, newCompanyName, newCompanyPhoneNumber]
  );

  const handleSubmit = async () => {
    await alerts.withApiErrorHandling(async () => {
      const apiResponse = await api.graphQlMutate(
        UPDATE_COMPANY_DETAILS,
        {
          companyId: company?.id,
          newName: newCompanyName,
          newPhoneNumber: newCompanyPhoneNumber
        },
        { context: { nonPublicApi: false } }
      );

      const { id } = apiResponse?.data?.updateCompanyDetails;
      adminStore.dispatch({
        type: ADMIN_ACTIONS.updateCompanyNameAndPhoneNumber,
        payload: {
          companyId: id,
          companyName: newCompanyName,
          companyPhoneNumber: newCompanyPhoneNumber
        }
      });
      alerts.success(
        "Les détails de l'entreprise ont bien été enregistrés",
        "",
        6000
      );
      handleClose();
    }, "update-company-details");
  };
  return (
    <Modal isOpen={open} hide={handleClose} size="lg">
      <ModalTitle>Modifier les détails de l'entreprise</ModalTitle>
      <ModalContent>
        <div className="fr-input-group">
          <label htmlFor="company-name" className={`fr-label ${classes.label}`}>
            Nom usuel
          </label>
          <TextInput
            id="company-name"
            value={newCompanyName}
            onChange={e => setNewCompanyName(e.target.value)}
          />
        </div>
        <PhoneNumber
          currentPhoneNumber={newCompanyPhoneNumber || undefined}
          setCurrentPhoneNumber={newNumber =>
            setNewCompanyPhoneNumber(newNumber)
          }
        />
      </ModalContent>
      <ModalFooter>
        <Stack
          direction="row-reverse"
          justifyContent="flex-start"
          p={2}
          spacing={4}
          width="100%"
        >
          <Button
            title="Enregistrer les détails de l'entreprise"
            onClick={handleSubmit}
            disabled={!canSave}
          >
            Enregistrer
          </Button>
          <Button
            title="Annuler les modifications"
            onClick={handleClose}
            secondary
          >
            Annuler
          </Button>
        </Stack>
      </ModalFooter>
    </Modal>
  );
}
