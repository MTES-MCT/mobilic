import React from "react";

import {
  Button,
  Checkbox,
  Modal,
  ModalContent,
  ModalFooter,
  ModalTitle,
  TextInput
} from "@dataesr/react-dsfr";
import { makeStyles } from "@mui/styles";
import { PhoneNumber } from "../../common/PhoneNumber";

import Stack from "@mui/material/Stack";
import { BusinessType } from "../../common/BusinessType";
import { useUpdateCompanyDetails } from "../../common/useUpdateCompanyDetails";

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
  const {
    newCompanyName,
    setNewCompanyName,
    newCompanyPhoneNumber,
    setNewCompanyPhoneNumber,
    setNewCompanyBusinessType,
    hasBusinessTypeChanged,
    updateCompanyDetails
  } = useUpdateCompanyDetails(company, adminStore, handleClose);

  const [
    applyBusinessTypeToEmployees,
    setApplyBusinessTypeToEmployees
  ] = React.useState(false);

  const canSave = React.useMemo(
    () =>
      newCompanyName &&
      (newCompanyName !== company?.name ||
        newCompanyPhoneNumber !== company?.phoneNumber ||
        hasBusinessTypeChanged),
    [
      company?.phoneNumber,
      company?.name,
      newCompanyName,
      newCompanyPhoneNumber,
      hasBusinessTypeChanged
    ]
  );

  const handleSubmit = async () =>
    await updateCompanyDetails(applyBusinessTypeToEmployees);

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
        {adminStore.business && (
          <>
            <BusinessType
              currentBusiness={adminStore.business}
              onChangeBusinessType={setNewCompanyBusinessType}
              required
            />
            <Checkbox
              checked={applyBusinessTypeToEmployees}
              onChange={e => setApplyBusinessTypeToEmployees(e.target.checked)}
              label="Attribuer cette activité à tous mes salariés"
              hint="L'activité sera attribuée par défaut à tous vos salariés. Vous aurez ensuite la possibilité de modifier individuellement le type d'activité pour chaque salarié."
              disabled={!hasBusinessTypeChanged}
            />
          </>
        )}
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
