import React from "react";
import Modal from "../../common/Modal";
import { WebinarList } from "../../landing/components/WebinarList";

export default function WebinarsModal({ open, handleClose, handleSubmit }) {
  const [
    cantDisplayWebinarsBecauseNoneOrError,
    setCantDisplayWebinarsBecauseNoneOrError
  ] = React.useState();

  return (
    <Modal
      open={open}
      handleClose={handleClose}
      title="Prochains webinaires Mobilic"
      content={
        <>
          Inscrivez-vous à l’un de nos webinaires pour assister à une
          démonstration de l’usage de Mobilic et obtenir toutes les réponses à
          vos questions :
          {!cantDisplayWebinarsBecauseNoneOrError && (
            <WebinarList
              setCantDisplayWebinarsBecauseNoneOrError={
                setCantDisplayWebinarsBecauseNoneOrError
              }
            />
          )}
        </>
      }
    />
  );
}
