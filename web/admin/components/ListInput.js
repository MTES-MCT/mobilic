import React from "react";
import { Input } from "../../common/forms/Input";
import { TagsGroup } from "@codegouvfr/react-dsfr/TagsGroup";

export function entryLabel(entry) {
  return entry.type === "id" ? `ID: ${entry.value}` : entry.value;
}

export default function ListInput({
  list,
  removeEntry = list.removeEntry,
  inputLabel = "Adresses e-mail ou identifiants Mobilic",
  inputHintText = "Exemple : prenom.nom@domaine.fr ou 123456789. Séparez les entrées par un espace, une virgule ou un point-virgule.",
}) {
  return (
    <>
      <Input
        label={inputLabel}
        hintText={inputHintText}
        textArea
        state={list.isError ? "error" : "default"}
        stateRelatedMessage={list.errorMessage}
        nativeTextAreaProps={{
          onChange: (e) => list.parseText(e.target.value),
          onBlur: (e) => list.parseText(e.target.value, false),
          onPaste: list.handlePaste,
          value: list.text,
        }}
        disabled={list.tooManyEntries}
      />
      <TagsGroup
        tags={list.entries.map((entry) => ({
          children: entryLabel(entry),
          dismissible: true,
          nativeButtonProps: {
            onClick: () => removeEntry(entry.value),
            "aria-label": `Retirer ${entry.value}`,
          },
        }))}
      />
    </>
  );
}
