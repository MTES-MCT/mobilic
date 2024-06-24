import React from "react";

import {
  Button,
  Modal,
  ModalContent,
  ModalFooter,
  ModalTitle
} from "@dataesr/react-dsfr";
import Stack from "@mui/material/Stack";
import { ExternalLink } from "../../common/ExternalLink";
import { useAdminCompanies, useAdminStore } from "../store/store";
import { BusinessType } from "../../common/BusinessType";
import { Box } from "@mui/material";
import { useUpdateCompanyDetails } from "../../common/useUpdateCompanyDetails";
import { clearUpdateTimeCookie, snooze } from "common/utils/updateBusinessType";

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
    <Modal isOpen={isOpen} hide={handleClose} size="lg">
      <ModalTitle>Veuillez indiquer votre type d'activité</ModalTitle>
      <ModalContent>
        <p>
          Ce renseignement est nécessaire pour appliquer la réglementation
          adaptée à votre type d'activité. Par défaut, l'activité sera attribuée
          à tous vos salariés. Vous aurez ensuite la possibilité de modifier le
          type d'activité pour chaque salarié.
        </p>
        <ExternalLink
          url="https://faq.mobilic.beta.gouv.fr/usages-et-fonctionnement-de-mobilic-gestionnaire/gestionnaire-parametrer-mon-entreprise"
          text="À quoi sert cette information ?"
          withIcon
        />
        <Box marginTop={2}>
          <BusinessType
            currentBusiness={adminStore.business}
            onChangeBusinessType={setNewCompanyBusinessType}
            required
          />
        </Box>
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
            title="Confirmer mon type d'activité"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            Confirmer
          </Button>
          <Button onClick={handleClose} secondary>
            Me le rappeler plus tard
          </Button>
        </Stack>
      </ModalFooter>
    </Modal>
  );
}
