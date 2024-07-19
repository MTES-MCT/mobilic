import React from "react";

import { Button } from "@dataesr/react-dsfr";
import { ExternalLink } from "../../common/ExternalLink";
import { useAdminCompanies, useAdminStore } from "../store/store";
import { BusinessType } from "../../common/BusinessType";
import { useUpdateCompanyDetails } from "../../common/useUpdateCompanyDetails";
import { clearUpdateTimeCookie, snooze } from "common/utils/updateBusinessType";
import { MandatoryField } from "../../common/MandatoryField";
import Modal from "../../common/Modal";
import Box from "@mui/material/Box";

export default function UpdateCompanyBusinessTypeModal() {
  const adminStore = useAdminStore();
  const [, company] = useAdminCompanies();

  const [isOpen, setIsOpen] = React.useState(true);
  const handleClose = () => {
    snooze();
    setIsOpen(false);
  };
  const {
    setNewCompanyBusinessType,
    hasBusinessTypeChanged,
    updateCompanyDetails
  } = useUpdateCompanyDetails(company, adminStore, handleClose);

  const canSubmit = React.useMemo(() => !!hasBusinessTypeChanged, [
    hasBusinessTypeChanged
  ]);

  const handleSubmit = async () => {
    await updateCompanyDetails(true);
    clearUpdateTimeCookie();
  };

  return (
    <Modal
      open={isOpen}
      handleClose={handleClose}
      size="sm"
      title="Veuillez indiquer votre type d'activité"
      content={
        <>
          <p>
            Ce renseignement est nécessaire pour appliquer la réglementation
            adaptée à votre type d'activité. Par défaut, l'activité sera
            attribuée à tous vos salariés. Vous aurez ensuite la possibilité de
            modifier le type d'activité pour chaque salarié.
          </p>
          <ExternalLink
            url="https://faq.mobilic.beta.gouv.fr/usages-et-fonctionnement-de-mobilic-gestionnaire/gestionnaire-parametrer-mon-entreprise"
            text="À quoi sert cette information ?"
            withIcon
          />
          <Box marginTop={2}>
            <MandatoryField />
          </Box>
          <Box marginTop={2}>
            <BusinessType
              currentBusiness={adminStore.business}
              onChangeBusinessType={setNewCompanyBusinessType}
              required
              forceColumn
            />
          </Box>
        </>
      }
      actions={
        <>
          <Button
            title="Confirmer mon type d'activité"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            Confirmer
          </Button>
          <Button onClick={handleClose} secondary>
            Me le rappeler plus tard
          </Button>
        </>
      }
    />
  );
}
