import React from "react";

import { useApi } from "common/utils/api";

import {
  Button,
  Checkbox,
  Modal,
  ModalContent,
  ModalFooter,
  ModalTitle,
  TextInput
} from "@dataesr/react-dsfr";
import { PhoneNumber } from "../../common/PhoneNumber";
import {
  UPDATE_COMPANY_DETAILS,
  UPDATE_COMPANY_DETAILS_WITH_BUSINESS_TYPE
} from "common/utils/apiQueries";
import { ADMIN_ACTIONS } from "../store/reducers/root";
import Stack from "@mui/material/Stack";
import { useSnackbarAlerts } from "../../common/Snackbar";
import { BusinessType } from "../../common/BusinessType";

export default function UpdateCompanyDetailsModal({
  open,
  handleClose,
  company,
  adminStore
}) {
  const api = useApi();
  const alerts = useSnackbarAlerts();

  const [newCompanyName, setNewCompanyName] = React.useState(company?.name);
  const [newCompanyPhoneNumber, setNewCompanyPhoneNumber] = React.useState(
    company?.phoneNumber
  );
  const [newCompanyBusinessType, setNewCompanyBusinessType] = React.useState(
    adminStore.business?.BusinessType
  );
  const [
    applyBusinessTypeToEmployees,
    setApplyBusinessTypeToEmployees
  ] = React.useState(false);

  const hasBusinessTypeChanged = React.useMemo(
    () => newCompanyBusinessType !== adminStore.business?.businessType,
    [newCompanyBusinessType, adminStore.business?.businessType]
  );

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

  const handleSubmit = async () => {
    await alerts.withApiErrorHandling(async () => {
      const apiResponse = await api.graphQlMutate(
        hasBusinessTypeChanged
          ? UPDATE_COMPANY_DETAILS_WITH_BUSINESS_TYPE
          : UPDATE_COMPANY_DETAILS,
        {
          companyId: company?.id,
          newName: newCompanyName,
          newPhoneNumber: newCompanyPhoneNumber,
          ...(hasBusinessTypeChanged
            ? {
                newBusinessType: newCompanyBusinessType,
                applyBusinessTypeToEmployees
              }
            : {})
        },
        { context: { nonPublicApi: false } }
      );

      const { id, business } = apiResponse?.data?.updateCompanyDetails;
      await adminStore.dispatch({
        type: ADMIN_ACTIONS.updateCompanyNameAndPhoneNumber,
        payload: {
          companyId: id,
          companyName: newCompanyName,
          companyPhoneNumber: newCompanyPhoneNumber
        }
      });
      await adminStore.dispatch({
        type: ADMIN_ACTIONS.updateBusinessType,
        payload: {
          business
        }
      });
      if (hasBusinessTypeChanged) {
        const { employments } = apiResponse?.data?.updateCompanyDetails;
        for (const employment of employments) {
          await adminStore.dispatch({
            type: ADMIN_ACTIONS.update,
            payload: {
              id: employment.id,
              entity: "employments",
              update: {
                ...employment,
                companyId: id,
                adminStore
              }
            }
          });
        }
      }
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
