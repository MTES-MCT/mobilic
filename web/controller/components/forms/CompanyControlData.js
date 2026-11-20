import React from "react";

import { SearchBar } from "@codegouvfr/react-dsfr/SearchBar";
import { Input } from "../../../common/forms/Input";
import { Select } from "../../../common/forms/Select";
import { useApi } from "common/utils/api";
import { formatApiError } from "common/utils/errors";
import { sirenValidationErrorMessage } from "../../../common/utils/siren";
import { SirenFieldset } from "../../../common/forms/SirenFieldset";
import { SIREN_QUERY } from "common/utils/apiQueries/misc";

const OTHER_COMPANY = "__other__";
const OTHER_SIREN_INPUT_ID = "bdc-other-siren";

export function CompanyControlData({
  siren,
  setSiren,
  companyName,
  setCompanyName,
  companyAddress,
  setCompanyAddress,
  showErrors,
  employments
}) {
  const api = useApi();

  const [sirenError, setSirenError] = React.useState(null);
  const [repertoryComplete, setRepertoryComplete] = React.useState(true);

  const companyOptions = React.useMemo(() => {
    const seen = new Set();
    return (employments || []).reduce((options, { company }) => {
      if (company?.siren && !seen.has(company.siren)) {
        seen.add(company.siren);
        options.push({ siren: company.siren, name: company.name });
      }
      return options;
    }, []);
  }, [employments]);

  const hasCompanyList = companyOptions.length > 0;

  const [isOtherCompany, setIsOtherCompany] = React.useState(
    () => !!siren && !companyOptions.some(option => option.siren === siren)
  );

  const fetchCompanyInfo = async (sirenValue, { withName }) => {
    try {
      const { data } = await api.graphQlQuery(
        SIREN_QUERY,
        { siren: sirenValue },
        { context: { nonPublicApi: true } }
      );
      const { sirenInfo } = data;
      const hasAddress = sirenInfo.facilities.length > 0;
      if (withName) {
        setCompanyName(sirenInfo.legalUnit.name || "");
      }
      setCompanyAddress(
        hasAddress
          ? `${sirenInfo.facilities[0].address} ${sirenInfo.facilities[0].postal_code}`
          : ""
      );
      setRepertoryComplete(
        hasAddress && (!withName || !!sirenInfo.legalUnit.name)
      );
    } catch (err) {
      setRepertoryComplete(false);
      setSirenError(formatApiError(err));
    }
  };

  React.useEffect(() => {
    if (
      hasCompanyList &&
      !siren &&
      !isOtherCompany &&
      companyOptions.length === 1
    ) {
      const onlyCompany = companyOptions[0];
      setSiren(onlyCompany.siren);
      setCompanyName(onlyCompany.name);
      fetchCompanyInfo(onlyCompany.siren, { withName: false });
    }
  }, [hasCompanyList, companyOptions, siren, isOtherCompany]);

  const onSelectCompany = e => {
    const value = e.target.value;
    setSirenError(null);
    if (value === OTHER_COMPANY) {
      setIsOtherCompany(true);
      setSiren("");
      setCompanyName("");
      setCompanyAddress("");
      return;
    }
    setIsOtherCompany(false);
    const option = companyOptions.find(company => company.siren === value);
    if (option) {
      setSiren(option.siren);
      setCompanyName(option.name);
      fetchCompanyInfo(option.siren, { withName: false });
    }
  };

  const onSearchOtherSiren = text => {
    const cleanSiren = text.replace(/\s/g, "");
    const formatError = sirenValidationErrorMessage(cleanSiren);
    if (formatError) {
      setSirenError(formatError);
      return;
    }
    setSirenError(null);
    fetchCompanyInfo(cleanSiren, { withName: true });
  };

  const validateManualSiren = async e => {
    const input = e.target.value;
    if (/^[0-9]/.test(input)) {
      const formatError = sirenValidationErrorMessage(input);
      if (formatError) {
        setSirenError(formatError);
      } else {
        await fetchCompanyInfo(input, { withName: true });
      }
    } else if (!input) {
      setSirenError("Veuillez remplir ce champ.");
    }
  };

  if (!hasCompanyList) {
    return (
      <>
        <SirenFieldset>
          <Input
            label="Entreprise responsable (de rattachement)"
            hintText="SIREN ou Numéro TVA"
            nativeInputProps={{
              value: siren,
              name: "siren",
              onChange: e => {
                setSiren(e.target.value.replace(/\s/g, ""));
                setSirenError(null);
              },
              onBlur: validateManualSiren
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
            onChange: e => setCompanyName(e.target.value),
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
            onChange: e => setCompanyAddress(e.target.value),
            name: "companyAddress"
          }}
          state={!companyAddress && showErrors ? "error" : "default"}
          stateRelatedMessage="Veuillez compléter ce champ."
          required
        />
      </>
    );
  }

  return (
    <>
      <Select
        label="Entreprise de rattachement"
        nativeSelectProps={{
          value: isOtherCompany ? OTHER_COMPANY : siren || "",
          name: "companySelection",
          onChange: onSelectCompany
        }}
        state={!siren && !isOtherCompany && showErrors ? "error" : "default"}
        stateRelatedMessage="Veuillez sélectionner une entreprise."
        required
      >
        <option value="" disabled>
          Sélectionnez une entreprise
        </option>
        {companyOptions.map(option => (
          <option key={option.siren} value={option.siren}>
            {option.name}
          </option>
        ))}
        <option value={OTHER_COMPANY}>Autre entreprise</option>
      </Select>

      {isOtherCompany ? (
        <SirenFieldset>
          <label className="fr-label" htmlFor={OTHER_SIREN_INPUT_ID}>
            N° SIREN de l'entreprise
          </label>
          <SearchBar
            id={OTHER_SIREN_INPUT_ID}
            label=""
            renderInput={({ className, id, type }) => (
              <input
                id={id}
                className={className}
                type={type}
                placeholder="SIREN ou Numéro TVA"
                value={siren || ""}
                aria-describedby={
                  sirenError ? `${OTHER_SIREN_INPUT_ID}-error` : undefined
                }
                onChange={e => {
                  setSiren(e.target.value.replace(/\s/g, ""));
                  setSirenError(null);
                }}
              />
            )}
            onButtonClick={onSearchOtherSiren}
          />
        </SirenFieldset>
      ) : (
        <Input
          label="N° SIREN de l'entreprise"
          nativeInputProps={{
            value: siren || "",
            name: "siren",
            disabled: true
          }}
        />
      )}
      {sirenError && (
        <p className="fr-error-text" id={`${OTHER_SIREN_INPUT_ID}-error`}>
          {sirenError}
        </p>
      )}

      {isOtherCompany && (
        <Input
          label="Nom de l'entreprise"
          nativeInputProps={{
            value: companyName || "",
            name: "companyName",
            onChange: e => setCompanyName(e.target.value),
            disabled: repertoryComplete
          }}
          state={!companyName && showErrors ? "error" : "default"}
          stateRelatedMessage="Veuillez compléter ce champ."
        />
      )}

      <Input
        label="Adresse de l'entreprise"
        nativeInputProps={{
          value: companyAddress || "",
          name: "companyAddress",
          onChange: e => setCompanyAddress(e.target.value),
          disabled: repertoryComplete
        }}
        state={!companyAddress && showErrors ? "error" : "default"}
        stateRelatedMessage="Veuillez compléter ce champ."
      />
    </>
  );
}
