export const HTTP_QUERIES = {
  subscribeToNewsletter: {
    method: "POST",
    endpoint: "/contacts/subscribe-to-newsletter"
  },
  verifyXlsxSignature: {
    method: "POST",
    endpoint: "/control/verify-xlsx-signature"
  },
  generateUserReadToken: {
    method: "POST",
    endpoint: "/control/generate-user-read-token"
  },
  refresh: {
    method: "POST",
    endpoint: "/token/refresh"
  },
  logout: {
    method: "POST",
    endpoint: "/token/logout"
  },
  excelExport: {
    method: "POST",
    endpoint: "/companies/download_activity_report"
  },
  userC1bExport: {
    method: "POST",
    endpoint: "/users/generate_tachograph_file"
  },
  companyC1bExport: {
    method: "POST",
    endpoint: "/companies/generate_tachograph_files"
  },
  pdfExport: {
    method: "POST",
    endpoint: "/users/generate_pdf_export"
  },
  missionExport: {
    method: "POST",
    endpoint: "/users/generate_mission_export"
  },
  missionControlExport: {
    method: "POST",
    endpoint: "/users/generate_mission_control_export"
  },
  oauthAuthorize: {
    method: "GET",
    endpoint: "/oauth/authorize"
  },
  webinars: {
    method: "GET",
    endpoint: "/next-webinars"
  },
  controlExcelExport: {
    method: "POST",
    endpoint: "/controllers/download_control_report"
  },
  cancelExports: {
    method: "POST",
    endpoint: "/exports/cancel"
  },
  checkOutExports: {
    method: "POST",
    endpoint: "/exports/checkout"
  },
  controlXmlExport: {
    method: "POST",
    endpoint: "/controllers/download_control_xml"
  },
  controlC1bExport: {
    method: "POST",
    endpoint: "/controllers/download_control_c1b"
  },
  controlsC1bExport: {
    method: "POST",
    endpoint: "/controllers/generate_tachograph_files"
  },
  controlBDCExport: {
    method: "POST",
    endpoint: "/controllers/generate_control_bulletin"
  },
  controlPicturesGeneratePresignedUrls: {
    method: "POST",
    endpoint: "/controllers/control_pictures_generate_presigned_urls"
  },
  certificateSearch: {
    method: "POST",
    endpoint: "/companies/public_company_certification"
  },
  downloadFullDataWhenCGUrefused: {
    method: "POST",
    endpoint: "/users/download_full_data_when_CGU_refused"
  }
};
