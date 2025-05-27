import React from "react";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { MandatorySuffix } from "./forms/MandatorySuffix";

export const WAY_HEARD_OF_MOBILIC_CHOICES = [
  {
    value: "MAIL_MOBILIC",
    label: "Courriel de l'équipe Mobilic"
  },
  {
    value: "DURING_CONTROL",
    label: "Lors d'un contrôle"
  },
  {
    value: "MAIL_DREAL",
    label: "Courrier/courriel de la DREAL"
  },
  {
    value: "WORD_OF_MOUTH",
    label:
      "Bouche à oreille (en entreprise, donneur d’ordre, collègue, client…)"
  },
  {
    value: "PROFESSIONAL_TRAINING",
    label: "Formation professionnelle"
  },
  {
    value: "SECTOR_ORGANIZATION",
    label: "Syndicat, fédération / organisation professionnelle"
  },
  {
    value: "SOCIAL_NETWORK",
    label: "Sur les réseaux sociaux"
  },
  {
    value: "SEARCH_ENGINE",
    label: "Recherche internet"
  }
];

export const HEARD_OF_MOBILIC_OTHER_VALUE = "OTHER";

export function WayHeardOfMobilic({
  setWayHeardOfMobilic,
  touched = false,
  required
}) {
  const [selectValue, setSelectValue] = React.useState("");
  const [otherValue, setOtherValue] = React.useState("");

  const selectError = React.useMemo(() => touched && !selectValue, [
    selectValue,
    touched
  ]);

  const otherError = React.useMemo(
    () =>
      touched && selectValue === HEARD_OF_MOBILIC_OTHER_VALUE && !otherValue,
    [touched, selectValue, otherValue]
  );

  React.useEffect(() => {
    setWayHeardOfMobilic(
      selectValue === HEARD_OF_MOBILIC_OTHER_VALUE ? otherValue : selectValue
    );
  }, [selectValue, otherValue]);

  React.useEffect(() => {
    if (selectValue !== HEARD_OF_MOBILIC_OTHER_VALUE) {
      setOtherValue("");
    }
  }, [selectValue]);

  const handleRadioChange = event => {
    const newValue = event.target.value;
    setSelectValue(newValue);
  };

  const handleOtherInputChange = event => {
    const value = event.target.value.trimStart();
    setOtherValue(value);
  };

  return (
    <>
      <RadioButtons
        legend={
          <>
            Comment avez-vous connu Mobilic ? <MandatorySuffix />
          </>
        }
        options={[
          ...WAY_HEARD_OF_MOBILIC_CHOICES.map(choice => ({
            value: choice.value,
            label: choice.label,
            nativeInputProps: { value: choice.value }
          })),
          {
            value: HEARD_OF_MOBILIC_OTHER_VALUE,
            label: "Autre",
            nativeInputProps: { value: HEARD_OF_MOBILIC_OTHER_VALUE }
          }
        ]}
        value={selectValue}
        required={required}
        state={selectError ? "error" : "default"}
        stateRelatedMessage={
          selectError ? "Veuillez compléter ce champ" : undefined
        }
        onChange={handleRadioChange}
      />
      {selectValue === HEARD_OF_MOBILIC_OTHER_VALUE && (
        <Input
          label="Précisez"
          nativeInputProps={{
            value: otherValue,
            onChange: handleOtherInputChange,
            maxLength: 250
          }}
          state={otherError ? "error" : "default"}
          stateRelatedMessage={
            otherError ? "Veuillez compléter ce champ" : undefined
          }
          required={required}
        />
      )}
    </>
  );
}
