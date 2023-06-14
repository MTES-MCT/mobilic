import React from "react";

import Stack from "@mui/material/Stack";
import { Radio, RadioGroup, Select, TextInput } from "@dataesr/react-dsfr";
import { COUNTRIES } from "../../utils/country";
import { CONTROL_BULLETIN_TRANSPORT_TYPE } from "../../utils/controlBulletin";

export function ControlBulletinFormStep2({
  handleEditControlBulletin,
  controlBulletin
}) {
  return (
    <Stack direction="column" p={2} sx={{ width: "100%" }}>
      <TextInput
        value={controlBulletin.siren || ""}
        name="siren"
        onChange={e => handleEditControlBulletin(e)}
        label="Entreprise responsable (de rattachement)"
        hint="N° SIREN"
        required
      />
      <TextInput
        value={controlBulletin.companyName || ""}
        name="companyName"
        onChange={e => handleEditControlBulletin(e)}
        label="Nom de l'entreprise"
        required
      />
      <TextInput
        value={controlBulletin.companyAddress || ""}
        name="companyAddress"
        onChange={e => handleEditControlBulletin(e)}
        label="Adresse de l'entreprise"
        required
      />
      <TextInput
        value={controlBulletin.vehicleRegistrationNumber || ""}
        name="vehicleRegistrationNumber"
        onChange={e => handleEditControlBulletin(e)}
        label="Immatriculation du véhicule"
        required
      />
      <Select
        label="Pays d'immatriculation"
        selected={controlBulletin.vehicleRegistrationCountry || ""}
        name="vehicleRegistrationCountry"
        required
        onChange={e => {
          handleEditControlBulletin(e);
        }}
        options={COUNTRIES}
      />
      <TextInput
        value={controlBulletin.missionAddressBegin || ""}
        name="missionAddressBegin"
        onChange={e => handleEditControlBulletin(e)}
        label="Provenance"
        required
      />
      <TextInput
        value={controlBulletin.missionAddressEnd || ""}
        name="missionAddressEnd"
        onChange={e => handleEditControlBulletin(e)}
        label="Destination"
        required
      />
      <RadioGroup
        legend="Type de transport"
        required
        onChange={e =>
          handleEditControlBulletin({
            target: { name: "transportType", value: e }
          })
        }
      >
        <Radio
          label={CONTROL_BULLETIN_TRANSPORT_TYPE.INTERIEUR.label}
          value={CONTROL_BULLETIN_TRANSPORT_TYPE.INTERIEUR.apiValue}
          defaultChecked={
            controlBulletin.transportType ===
            CONTROL_BULLETIN_TRANSPORT_TYPE.INTERIEUR.apiValue
          }
        />
        <Radio
          label={CONTROL_BULLETIN_TRANSPORT_TYPE.INTERNATIONAL.label}
          value={CONTROL_BULLETIN_TRANSPORT_TYPE.INTERNATIONAL.apiValue}
          defaultChecked={
            controlBulletin.transportType ===
            CONTROL_BULLETIN_TRANSPORT_TYPE.INTERNATIONAL.apiValue
          }
        />
        <Radio
          label={CONTROL_BULLETIN_TRANSPORT_TYPE.CABOTAGE.label}
          value={CONTROL_BULLETIN_TRANSPORT_TYPE.CABOTAGE.apiValue}
          defaultChecked={
            controlBulletin.transportType ===
            CONTROL_BULLETIN_TRANSPORT_TYPE.CABOTAGE.apiValue
          }
        />
      </RadioGroup>
      <TextInput
        value={controlBulletin.articlesNature || ""}
        name="articlesNature"
        onChange={e => handleEditControlBulletin(e)}
        label="Nature de la marchandise"
      />
      <TextInput
        value={controlBulletin.licenseNumber || ""}
        name="licenseNumber"
        onChange={e => handleEditControlBulletin(e)}
        label="N° de la licence"
      />
      <TextInput
        value={controlBulletin.licenseCopyNumber || ""}
        name="licenseCopyNumber"
        onChange={e => handleEditControlBulletin(e)}
        label="N° de copie conforme de la licence"
      />
    </Stack>
  );
}
