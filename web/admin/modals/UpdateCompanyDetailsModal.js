import React from "react";

import { Button, Checkbox, TextInput } from "@dataesr/react-dsfr";
import { PhoneNumber } from "../../common/PhoneNumber";

import { BusinessType } from "../../common/BusinessType";
import { useUpdateCompanyDetails } from "../../common/useUpdateCompanyDetails";
import Modal from "../../common/Modal";

export default function UpdateCompanyDetailsModal({
  open,
  handleClose,
  company,
  adminStore
}) {
  const {
    newCompanyName,
    setNewCompanyName,
    newCompanyPhoneNumber,
    setNewCompanyPhoneNumber,
    setNewCompanyBusinessType,
    hasBusinessTypeChanged,
    updateCompanyDetails,
    newCompanyBusinessType
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
        (hasBusinessTypeChanged && !!newCompanyBusinessType)),
    [
      company?.phoneNumber,
      company?.name,
      newCompanyName,
      newCompanyPhoneNumber,
      hasBusinessTypeChanged,
      newCompanyBusinessType
    ]
  );

  const handleSubmit = async () =>
    await updateCompanyDetails(applyBusinessTypeToEmployees);

  return (
    <Modal
      open={open}
      handleClose={handleClose}
      size="sm"
      title="Modifier les détails de l'entreprise"
      content={
        <>
          <div className="fr-input-group">
            <TextInput
              id="company-name"
              value={newCompanyName}
              onChange={e => setNewCompanyName(e.target.value)}
              label="Nom usuel"
              required
              {...(!newCompanyName ? { messageType: "error" } : {})}
              message={
                !newCompanyName
                  ? "Veuillez renseigner un nom pour l'entreprise"
                  : ""
              }
            />
          </div>
          <PhoneNumber
            currentPhoneNumber={newCompanyPhoneNumber || undefined}
            setCurrentPhoneNumber={newNumber =>
              setNewCompanyPhoneNumber(newNumber)
            }
            label="Numéro de téléphone de l'entreprise"
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
                onChange={e =>
                  setApplyBusinessTypeToEmployees(e.target.checked)
                }
                label="Attribuer cette activité à tous mes salariés"
                hint="L'activité sera attribuée par défaut à tous vos salariés. Vous aurez ensuite la possibilité de modifier individuellement le type d'activité pour chaque salarié."
                disabled={!hasBusinessTypeChanged}
              />
            </>
          )}
        </>
      }
      actions={
        <>
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
        </>
      }
    />
  );
}
