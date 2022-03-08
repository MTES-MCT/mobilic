export function updateCompanyIdReducer(state, { companyId }) {
  console.log("updateCompanyIdReducer", companyId);
  return {
    ...state,
    companyId
  };
}
