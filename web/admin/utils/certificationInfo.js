import React from "react";
import { useApi } from "common/utils/api";
import { useAdminCompanies, useAdminStore } from "../store/store";
import { COMPANY_CERTIFICATION_COMMUNICATION_QUERY } from "common/utils/apiQueries/certification";

export function useCertificationInfo() {
  const api = useApi();
  const [, company] = useAdminCompanies();
  const [companyWithInfo, setCompanyWithInfo] = React.useState({});
  const [loadingInfo, setLoadingInfo] = React.useState(true);

  React.useEffect(() => {
    const loadData = async () => {
      if (company) {
        setLoadingInfo(true);
        const apiResponse = await api.graphQlQuery(
          COMPANY_CERTIFICATION_COMMUNICATION_QUERY,
          {
            companyId: company.id
          }
        );
        setCompanyWithInfo(apiResponse?.data?.company);
        setLoadingInfo(false);
      }
    };
    loadData();
  }, [company]);

  return { companyWithInfo, loadingInfo };
}
