import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Button from "@mui/material/Button";
import { makeStyles } from "@mui/styles";
import { useApi } from "common/utils/api";
import { EDIT_COMPANIES_COMMUNICATION_SETTING } from "common/utils/apiQueries";
import React, { useMemo, useState } from "react";
import { useSnackbarAlerts } from "../../common/Snackbar";
import {
  CustomDialogActions,
  CustomDialogTitle
} from "../../common/CustomDialogTitle";
import { LoadingButton } from "common/components/LoadingButton";
import { Link } from "../../common/LinkButton";

const useStyles = makeStyles(theme => ({
  modalFooter: {
    display: "flex",
    flexDirection: "row-reverse"
  },
  modalButton: {
    marginLeft: theme.spacing(2)
  },
  prioritaryModal: {
    zIndex: 2500
  }
}));

export default function CertificationCommunicationModal({
  companies,
  onClose
}) {
  const classes = useStyles();
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
        ? `Acceptez-vous que nous communiquions sur ces certifications, notamment auprès des plateformes de mise en relation entre entreprises et particuliers ?`
        : `Acceptez-vous que nous communiquions sur cette certification, notamment auprès des plateformes de mise en relation entre entreprises et particuliers ?`,
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
          acceptCommunication: accept
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
    <Dialog
      className={classes.prioritaryModal}
      maxWidth="md"
      onClose={handleClose}
      open={isOpen}
      fullWidth
    >
      <CustomDialogTitle handleClose={handleClose} title={modalTitle} />
      <DialogContent>
        <p>{modalText}</p>
        <p>
          <Link
            href="https://faq.mobilic.beta.gouv.fr/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Qu'est ce que la certification Mobilic ?
          </Link>
        </p>
      </DialogContent>
      <CustomDialogActions>
        <Button
          className={classes.modalButton}
          title="Je refuse"
          secondary
          onClick={() => {
            handleSubmit(false);
          }}
        >
          Je refuse
        </Button>
        <LoadingButton
          className={classes.modalButton}
          title="J'accepte"
          color="primary"
          variant="contained"
          onClick={async e => {
            handleSubmit(true);
          }}
          loading={loading}
        >
          J'accepte
        </LoadingButton>
      </CustomDialogActions>
    </Dialog>
  );
}
