export function udpateEmploymentReducer(state, payload) {
  const { id } = payload;
  return {
    ...state,
    employments: state.employments.map(e =>
      e.id === id ? { ...e, ...payload } : e
    )
  };
}
