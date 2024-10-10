import { useApi } from "common/utils/api";
import { EDIT_COMPANIES_COMMUNICATION_SETTING } from "common/utils/apiQueries";
import React, { useMemo, useState } from "react";
import { useSnackbarAlerts } from "../../common/Snackbar";
import { LoadingButton } from "common/components/LoadingButton";
import { Link } from "../../common/LinkButton";
import Modal from "../../common/Modal";
import { Button } from "@codegouvfr/react-dsfr/Button";

export default function CertificationCommunicationModal({
  companies,
  onClose
}) {
  const api = useApi();
  const alerts = useSnackbarAlerts();
  const [isOpen, setIsOpen] = useState(true);

  const [loading, setLoading] = React.useState(false);
  const modalTitle = useMemo(() => {
    if (companies.length > 1) {
      const companyNames = `${companies
        .slice(1)
        .map(c => c.name)
        .join(", ")} et ${companies.slice(0, 1)[0].name}`;
      return `Félicitations, les entreprises ${companyNames} sont certifiées Mobilic !`;
    } else {
      return `Félicitations, l'entreprise ${companies[0].name} est certifiée Mobilic !`;
    }
  }, [companies]);

  const modalText = useMemo(
    () =>
      companies.length > 1
        ? `Acceptez-vous que nous communiquions sur ces certificats, notamment auprès des plateformes de mise en relation entre entreprises et particuliers ?`
        : `Acceptez-vous que nous communiquions sur ce certificat, notamment auprès des plateformes de mise en relation entre entreprises et particuliers ?`,
    [companies]
  );

  const handleSubmit = async accept => {
    setLoading(true);
    await alerts.withApiErrorHandling(async () => {
      const companyIds = companies.map(c => c.id);
      await api.graphQlMutate(
        EDIT_COMPANIES_COMMUNICATION_SETTING,
        {
          companyIds: companyIds,
          acceptCertificationCommunication: accept
        },
        { context: { nonPublicApi: true } }
      );
      alerts.success(
        "Vos préférences de communication ont bien été prises en compte.",
        "",
        6000
      );
      handleClose();
    }, "certification-communication");
    setLoading(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  return (
    <Modal
      title={modalTitle}
      open={isOpen}
      handleClose={handleClose}
      content={
        <>
          <p>{modalText}</p>
          <p>
            <Link
              href="https://faq.mobilic.beta.gouv.fr/usages-et-fonctionnement-de-mobilic-gestionnaire/comment-obtenir-le-certificat-mobilic"
              target="_blank"
              rel="noopener noreferrer"
            >
              Qu'est-ce que le certificat Mobilic ?
            </Link>
          </p>
        </>
      }
      actions={
        <>
          <Button
            priority="secondary"
            onClick={() => {
              handleSubmit(false);
            }}
          >
            Je refuse
          </Button>
          <LoadingButton
            onClick={async e => {
              handleSubmit(true);
            }}
            loading={loading}
          >
            J'accepte
          </LoadingButton>
        </>
      }
    />
  );
}
