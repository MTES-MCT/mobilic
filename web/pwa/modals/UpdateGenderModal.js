import React from "react";

import { Button } from "@codegouvfr/react-dsfr/Button";
import Modal from "../../common/Modal";
import GenderSelect from "../../common/GenderSelect";
import { useUpdateGender } from "../../home/useUpdateGender";

export default function UpdateGenderModal() {
  const [selectedGender, setSelectedGender] = React.useState(undefined);

  const canSubmit = React.useMemo(() => !!selectedGender, [selectedGender]);

  const { updateGender } = useUpdateGender();

  const handleSubmit = async () => {
    await updateGender(selectedGender);
  };

  return (
    <Modal
      open={true}
      size="sm"
      title="Veuillez indiquer votre sexe pour continuer à utiliser Mobilic"
      content={
        <>
          <p>
            Ce renseignement est nécessaire dans le cadre d’une étude menée par
            le ministère chargé des Transports visant à quantifier la part
            d’hommes et de femmes dans le transport routier léger.
          </p>
          <GenderSelect
            currentGender={selectedGender}
            onGenderChange={setSelectedGender}
          />
        </>
      }
      actions={
        <>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            Confirmer
          </Button>
        </>
      }
    />
  );
}
