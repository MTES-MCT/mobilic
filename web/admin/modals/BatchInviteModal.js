import React from "react";
import { LoadingButton } from "common/components/LoadingButton";
import Modal from "../../common/Modal";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useMatomo } from "@datapunt/matomo-tracker-react";
import { BATCH_INVITE_MODAL_SUBMIT } from "common/utils/matomoTags";
import useListEntries from "../hooks/useListEntries";
import ListInput from "../components/ListInput";

export default function BatchInviteModal({
  open,
  handleClose,
  handleSubmit,
  isNewAdmin = false,
  title = "",
  description = "",
  inputLabel = "Adresses e-mail ou identifiants Mobilic",
  inputHintText = "Saisissez des adresses e-mail (prenom.nom@domaine.fr) ou des identifiants Mobilic (nombres entiers). Si vous les copiez-collez, veillez à bien les séparer par un espace, une virgule ou un point-virgule dans le fichier d'origine.",
  acceptButtonTitle = "",
  onClose,
  validationFn,
  normalizeFn,
  validationErrorMessage,
  separatorsRegex,
  trackingEventFn = BATCH_INVITE_MODAL_SUBMIT
}) {
  const { trackEvent } = useMatomo();
  const list = useListEntries({
    validationFn,
    normalizeFn,
    validationErrorMessage,
    separatorsRegex
  });

  const _handleClose = () => {
    onClose?.();
    list.reset();
    handleClose();
  };

  return (
    <Modal
      open={open}
      handleClose={_handleClose}
      title={
        title ||
        (isNewAdmin
          ? "Invitez vos salariés sur Mobilic !"
          : "Inviter une liste d'emails ou d'identifiants")
      }
      content={
        <>
          {description ||
            (isNewAdmin ? (
              <>
                <p>
                  Invitez plusieurs salariés en une fois en renseignant leur
                  adresse e-mail ou identifiant Mobilic, ou en copiant une
                  liste dans l'encadré ci-dessous.
                </p>
                <p>
                  Une fois le compte créé, ils seront rattachés à votre
                  entreprise et pourront commencer à enregistrer du temps de
                  travail.
                </p>
              </>
            ) : (
              <p>
                Invitez plusieurs salariés en une fois en renseignant leur
                adresse e-mail ou identifiant Mobilic, ou en copiant une
                liste dans l'encadré ci-dessous.
              </p>
            ))}
          <ListInput
            list={list}
            inputLabel={inputLabel}
            inputHintText={inputHintText}
          />
        </>
      }
      actions={
        <>
          {isNewAdmin && (
            <Button onClick={_handleClose} priority="secondary">
              Plus tard
            </Button>
          )}
          <LoadingButton
            disabled={list.entries.length === 0 && !list.text.trim()}
            onClick={async () => {
              const finalEntries = list.finalizeEntries();
              if (!finalEntries) return;

              const emails = finalEntries
                .filter(en => en.type === "email")
                .map(en => en.value);
              const userIds = finalEntries
                .filter(en => en.type === "id")
                .map(en => parseInt(en.value, 10));

              trackEvent(trackingEventFn(finalEntries.length));
              const result = await handleSubmit({
                entries: finalEntries.map(en => en.value),
                emails,
                userIds
              });
              if (result?.failedEntries?.length > 0) {
                list.replaceEntries(result.failedEntries);
                return;
              }
              _handleClose();
            }}
          >
            {acceptButtonTitle || (isNewAdmin ? "Valider" : "Inviter")}
          </LoadingButton>
        </>
      }
    />
  );
}
