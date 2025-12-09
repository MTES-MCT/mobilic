import React from "react";

import { Input } from "../../../common/forms/Input";
import { useApi } from "common/utils/api";
import { formatApiError } from "common/utils/errors";
import { sirenValidationErrorMessage } from "../../../common/utils/siren";
import { SirenFieldset } from "../../../common/forms/SirenFieldset";
import { SIREN_QUERY } from "common/utils/apiQueries/misc";

export function CompanyControlData({
  siren,
  setSiren,
  companyName,
  setCompanyName,
  companyAddress,
  setCompanyAddress,
  showErrors
}) {
  const api = useApi();

  const [sirenError, setSirenError] = React.useState(null);

  const validateSiren = async (e) => {
    const input = e.target.value;
    const looksLikeASiren = /^[0-9]/.test(input);
    if (looksLikeASiren) {
      const sirenFormatError = sirenValidationErrorMessage(input);
      if (sirenFormatError) {
        setSirenError(sirenFormatError);
      } else {
        try {
          const sirenResponse = await api.graphQlQuery(
            SIREN_QUERY,
            {
              siren
            },
            { context: { nonPublicApi: true } }
          );
          const { sirenInfo } = sirenResponse.data;
          setCompanyName(sirenInfo.legalUnit.name);
          if (sirenInfo.facilities.length > 0) {
            setCompanyAddress(
              `${sirenInfo.facilities[0].address} ${sirenInfo.facilities[0].postal_code}`
            );
          } else {
            setCompanyAddress("");
          }
        } catch (err) {
          setSirenError(formatApiError(err));
        }
      }
    } else if (!input) {
      setSirenError("Veuillez remplir ce champ.");
    }
  };

  return (
    <>
      <SirenFieldset>
        <Input
          label="Entreprise responsable (de rattachement)"
          hintText="SIREN ou Numéro TVA"
          nativeInputProps={{
            value: siren,
            name: "siren",
            onChange: (e) => {
              const cleanSiren = e.target.value.replace(/\s/g, "");
              setSiren(cleanSiren);
              setSirenError(null);
            },
            onBlur: (e) => validateSiren(e)
          }}
          state={sirenError ? "error" : "default"}
          stateRelatedMessage={sirenError}
          required
        />
      </SirenFieldset>

      <Input
        label="Nom de l'entreprise"
        nativeInputProps={{
          value: companyName,
          onChange: (e) => setCompanyName(e.target.value),
          name: "companyName"
        }}
        state={!companyName && showErrors ? "error" : "default"}
        stateRelatedMessage="Veuillez compléter ce champ."
        required
      />
      <Input
        label="Adresse de l'entreprise"
        nativeInputProps={{
          value: companyAddress,
          onChange: (e) => setCompanyAddress(e.target.value),
          name: "companyAddress"
        }}
        state={!companyAddress && showErrors ? "error" : "default"}
        stateRelatedMessage="Veuillez compléter ce champ."
        required
      />
    </>
  );
}
