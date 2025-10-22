import React from "react";

export function useEmploymentData(employments, companySiren, companyName) {
  const matchingEmployment = React.useMemo(() => {
    if (!employments || employments.length === 0) return null;

    if (companySiren) {
      const sirenMatch = employments.find(
        employment => employment.company?.siren === companySiren
      );
      if (sirenMatch) return sirenMatch;
    }

    if (companyName) {
      const companyNameLower = companyName.toLowerCase().trim();

      const nameMatch = employments.find(employment => {
        const company = employment.company;
        if (!company) return false;

        const legalName = company.legalName?.toLowerCase().trim() || "";
        const usualName = company.name?.toLowerCase().trim() || "";

        return (
          legalName.includes(companyNameLower) ||
          companyNameLower.includes(legalName) ||
          usualName.includes(companyNameLower) ||
          companyNameLower.includes(usualName)
        );
      });

      if (nameMatch) return nameMatch;
    }
    if (employments.length === 1) {
      return employments[0];
    }

    return null;
  }, [employments, companySiren, companyName]);

  const targetCompany = matchingEmployment?.company;
  const displayCompanyName =
    targetCompany?.legalName || targetCompany?.name || companyName;

  const adminEmails = React.useMemo(() => {
    if (!matchingEmployment?.company?.currentAdmins) {
      return [];
    }

    const emails = matchingEmployment.company.currentAdmins.map(
      admin => admin.email
    );
    return emails;
  }, [matchingEmployment, companySiren, companyName]);

  return {
    matchingEmployment,
    targetCompany,
    displayCompanyName,
    adminEmails
  };
}
