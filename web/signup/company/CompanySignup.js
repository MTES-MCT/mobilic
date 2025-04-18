import React from "react";
import { useApi } from "common/utils/api";
import { useHistory, useLocation } from "react-router-dom";
import Container from "@mui/material/Container";
import {
  broadCastChannel,
  useStoreSyncedWithLocalStorage
} from "common/store/store";
import { useSnackbarAlerts } from "../../common/Snackbar";
import { PaperContainerTitle } from "../../common/PaperContainer";
import SignupStepper from "../SignupStepper";
import {
  COMPANY_SIGNUP_MUTATION,
  COMPANIES_SIGNUP_MUTATION
} from "common/utils/apiQueries";
import { SubmitStep } from "./SubmitStep";
import { SelectSirenStep } from "./SelectSirenStep";
import { Steps } from "./Step";
import { SelectSiretsStep } from "./SelectSiretsStep";
import { OptInForSiretsSelectionStep } from "./OptInForSiretsSelectionStep";
import { usePageTitle } from "../../common/UsePageTitle";
import trackAds from "common/utils/trackAds";
import { hasGoogleAdsConsent } from "common/utils/cookie";

export function CompanySignup() {
  usePageTitle("Inscription de l'entreprise - Mobilic");
  const api = useApi();
  const history = useHistory();
  const location = useLocation();
  const store = useStoreSyncedWithLocalStorage();
  const alerts = useSnackbarAlerts();

  const [siren, setSiren] = React.useState("");
  const [sirenInfo, setSirenInfo] = React.useState(null);
  const [usualName, setUsualName] = React.useState("");
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [nbWorkers, setNbWorkers] = React.useState(0);
  const [businessType, setBusinessType] = React.useState("");
  const [shouldSelectSirets, setShouldSelectSirets] = React.useState(false);
  const [facilities, setFacilities] = React.useState([]);

  const sirenPartiallyRegistered =
    sirenInfo &&
    sirenInfo.registrationStatus &&
    sirenInfo.registrationStatus === "partially_registered";

  const willRegisterSeveralSirets =
    shouldSelectSirets || sirenPartiallyRegistered;

  const [
    shouldDisplaySignupProgress,
    setShouldDisplaySignupProgress
  ] = React.useState(false);

  const [loadingCompanySignup, setLoadingCompanySignup] = React.useState(false);

  React.useEffect(() => {
    const queryString = new URLSearchParams(location.search);
    const isOnboarding = queryString.get("onboarding") === "true";
    if (isOnboarding) setShouldDisplaySignupProgress(true);
  }, [location]);

  React.useEffect(() => {
    if (sirenInfo && sirenInfo.facilities)
      setFacilities(
        sirenInfo.facilities.map(f => ({ ...f, usualName: f.name }))
      );
    else setFacilities([]);
  }, [sirenInfo]);

  React.useEffect(() => {
    const firstSelectedFacility = facilities.find(f => f.selected);
    let name = firstSelectedFacility?.name;
    if (!name && sirenInfo && sirenInfo.legalUnit)
      name = sirenInfo.legalUnit.name;
    setUsualName(name);
  }, [sirenInfo, facilities]);

  const handleCompanySignup = async e => {
    e.preventDefault();

    if (process.env.REACT_APP_GOOGLE_ADS && hasGoogleAdsConsent()) {
      trackAds.trackGoogleAds();
    }

    setLoadingCompanySignup(true);
    await alerts.withApiErrorHandling(async () => {
      const payload = {
        siren: siren,
        usualName: usualName.trim(),
        phoneNumber,
        businessType,
        nbWorkers
      };
      const apiResponse = await api.graphQlMutate(
        COMPANY_SIGNUP_MUTATION,
        payload,
        { context: { nonPublicApi: true } }
      );
      const employment = apiResponse.data.signUp.company.employment;
      store.createEntityObject(employment, "employments");
      store.batchUpdate();
      await broadCastChannel.postMessage("update");
      history.push(
        shouldDisplaySignupProgress
          ? "/signup/complete"
          : "/signup/company_complete",
        { companiesName: [employment.company.name] }
      );
    }, "company-signup");
    setLoadingCompanySignup(false);
  };

  const handleCompaniesSignup = async e => {
    e.preventDefault();

    if (process.env.REACT_APP_GOOGLE_ADS && hasGoogleAdsConsent()) {
      trackAds.trackGoogleAds();
    }

    setLoadingCompanySignup(true);
    await alerts.withApiErrorHandling(async () => {
      const payload = {
        siren: siren,
        companies: facilities
          .filter(f => f.selected)
          .map(f => {
            return {
              siret: f.siret,
              usualName: f.usualName,
              phoneNumber: f.phoneNumber,
              businessType: f.businessType,
              nbWorkers: f.nbWorkers
            };
          })
      };
      const apiResponse = await api.graphQlMutate(
        COMPANIES_SIGNUP_MUTATION,
        payload,
        { context: { nonPublicApi: true } }
      );
      const employments = apiResponse.data.signUp.companies.map(
        c => c.employment
      );
      store.createEntityObject(employments, "employments");
      store.batchUpdate();
      await broadCastChannel.postMessage("update");
      history.push(
        shouldDisplaySignupProgress
          ? "/signup/complete"
          : "/signup/company_complete",
        {
          companiesName: employments.map(employment => employment.company.name)
        }
      );
    }, "company-signup");
    setLoadingCompanySignup(false);
  };

  return (
    <Container
      style={{ paddingBottom: "16px" }}
      className="centered"
      maxWidth="sm"
    >
      {shouldDisplaySignupProgress && <SignupStepper activeStep={1} />}
      <PaperContainerTitle>Inscription de l'entreprise</PaperContainerTitle>
      <Steps>
        <SelectSirenStep
          name="select-siren"
          title="Quel est le numéro SIREN de l'entreprise ?"
          siren={siren}
          setSiren={setSiren}
          sirenInfo={sirenInfo}
          setSirenInfo={setSirenInfo}
        />
        {facilities.length > 1 && !sirenPartiallyRegistered && (
          <OptInForSiretsSelectionStep
            name="opt-in-for-sirets-selection"
            title="Gérez-vous plusieurs établissements au sein de cette entreprise ?"
            shouldSelectSirets={shouldSelectSirets}
            setShouldSelectSirets={setShouldSelectSirets}
          />
        )}
        {willRegisterSeveralSirets && (
          <SelectSiretsStep
            name="select-sirets"
            title="Veuillez sélectionner un ou plusieurs établissements"
            facilities={facilities}
            setFacilities={setFacilities}
          />
        )}
        {willRegisterSeveralSirets ? (
          <SubmitStep
            name="finalize"
            handleSubmit={handleCompaniesSignup}
            loading={loadingCompanySignup}
          />
        ) : (
          <SubmitStep
            name="finalize"
            title="Quel est le nom de l'entreprise ?"
            companyName={usualName}
            setCompanyName={setUsualName}
            phoneNumber={phoneNumber}
            setPhoneNumber={setPhoneNumber}
            businessType={businessType}
            setBusinessType={setBusinessType}
            nbWorkers={nbWorkers}
            setNbWorkers={setNbWorkers}
            handleSubmit={handleCompanySignup}
            loading={loadingCompanySignup}
          />
        )}
      </Steps>
    </Container>
  );
}
