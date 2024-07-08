import React from "react";
import { useApi } from "common/utils/api";
import { useSnackbarAlerts } from "./Snackbar";
import {
  UPDATE_COMPANY_DETAILS,
  UPDATE_COMPANY_DETAILS_WITH_BUSINESS_TYPE
} from "common/utils/apiQueries";
import { ADMIN_ACTIONS } from "../admin/store/reducers/root";

export const useUpdateCompanyDetails = (
  company,
  adminStore,
  handleAfterSubmit
) => {
  const api = useApi();
  const alerts = useSnackbarAlerts();

  const [newCompanyName, setNewCompanyName] = React.useState(company?.name);
  const [newCompanyPhoneNumber, setNewCompanyPhoneNumber] = React.useState(
    company?.phoneNumber
  );
  const [newCompanyBusinessType, setNewCompanyBusinessType] = React.useState(
    adminStore.business?.businessType
  );

  const hasBusinessTypeChanged = React.useMemo(
    () => newCompanyBusinessType !== adminStore.business?.businessType,
    [newCompanyBusinessType, adminStore.business?.businessType]
  );

  const updateCompanyDetails = async applyBusinessTypeToEmployees => {
    await alerts.withApiErrorHandling(async () => {
      const apiResponse = await api.graphQlMutate(
        hasBusinessTypeChanged
          ? UPDATE_COMPANY_DETAILS_WITH_BUSINESS_TYPE
          : UPDATE_COMPANY_DETAILS,
        {
          companyId: company?.id,
          newName: newCompanyName || null,
          newPhoneNumber: newCompanyPhoneNumber || null,
          ...(hasBusinessTypeChanged
            ? {
                newBusinessType: newCompanyBusinessType,
                applyBusinessTypeToEmployees
              }
            : {})
        },
        { context: { nonPublicApi: false } }
      );

      const id = apiResponse?.data?.updateCompanyDetails?.id;
      const business = apiResponse?.data?.updateCompanyDetails?.business;
      const name = apiResponse?.data?.updateCompanyDetails?.name;
      const phoneNumber = apiResponse?.data?.updateCompanyDetails?.phoneNumber;
      await adminStore.dispatch({
        type: ADMIN_ACTIONS.updateCompanyNameAndPhoneNumber,
        payload: {
          companyId: id,
          companyName: name,
          companyPhoneNumber: phoneNumber
        }
      });
      await adminStore.dispatch({
        type: ADMIN_ACTIONS.updateBusinessType,
        payload: {
          business
        }
      });
      if (hasBusinessTypeChanged) {
        const employments =
          apiResponse?.data?.updateCompanyDetails?.employments;
        for (const employment of employments) {
          await adminStore.dispatch({
            type: ADMIN_ACTIONS.update,
            payload: {
              id: employment.id,
              entity: "employments",
              update: {
                ...employment,
                companyId: id,
                adminStore
              }
            }
          });
        }
      }
      alerts.success(
        "Les détails de l'entreprise ont bien été enregistrés",
        "",
        6000
      );
      handleAfterSubmit();
    }, "update-company-details");
  };
  return {
    newCompanyName,
    setNewCompanyName,
    newCompanyPhoneNumber,
    setNewCompanyPhoneNumber,
    setNewCompanyBusinessType,
    hasBusinessTypeChanged,
    updateCompanyDetails,
    newCompanyBusinessType
  };
};
