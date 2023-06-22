import React from "react";
import { useApi } from "common/utils/api";
import { useAdminCompanies } from "../store/store";
import { COMPANY_CERTIFICATION_COMMUNICATION_QUERY } from "common/utils/apiQueries";

export function useCertificationInfo() {
  const api = useApi();
  const [, company] = useAdminCompanies();
  const [companyWithInfo, setCompanyWithInfo] = React.useState({});
  const [loadingInfo, setLoadingInfo] = React.useState(true);

  React.useEffect(async () => {
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
  }, [company]);

  return { companyWithInfo, loadingInfo };
}
