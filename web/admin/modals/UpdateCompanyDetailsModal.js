import React from "react";

import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { PhoneNumber } from "../../common/PhoneNumber";

import { BusinessType } from "../../common/BusinessType";
import { useUpdateCompanyDetails } from "../../common/useUpdateCompanyDetails";
import Modal from "../../common/Modal";
import { MandatoryField } from "../../common/MandatoryField";
import { Input } from "../../common/forms/Input";

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
          <MandatoryField />
          <div className="fr-input-group">
            <Input
              label="Nom usuel"
              state={!newCompanyName ? "error" : "default"}
              stateRelatedMessage={
                !newCompanyName ? "Veuillez compléter ce champ." : ""
              }
              nativeInputProps={{
                id: "company-name",
                value: newCompanyName,
                onChange: e => setNewCompanyName(e.target.value)
              }}
              required
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
                legend=""
                options={[
                  {
                    hintText:
                      "L'activité sera attribuée par défaut à tous vos salariés. Vous aurez ensuite la possibilité de modifier individuellement le type d'activité pour chaque salarié.",
                    label: "Attribuer cette activité à tous mes salariés",
                    nativeInputProps: {
                      name: "cb-applyBusinessTypeToEmployees",
                      value: applyBusinessTypeToEmployees,
                      onChange: e =>
                        setApplyBusinessTypeToEmployees(e.target.checked)
                    }
                  }
                ]}
                disabled={!hasBusinessTypeChanged}
              />
            </>
          )}
        </>
      }
      actions={
        <>
          <Button onClick={handleClose} priority="secondary">
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={!canSave}>
            Enregistrer
          </Button>
        </>
      }
    />
  );
}
