export function addVirtualExpenditureActionReducer(
  state,
  { virtualExpenditureAction }
) {
  if (
    virtualExpenditureAction.action === "cancel" &&
    state.virtualExpenditureActions.find(
      v => v.expenditureId === virtualExpenditureAction.payload.expenditureId
    )
  ) {
    return {
      ...state,
      virtualExpenditureActions: state.virtualExpenditureActions.filter(
        v => v.expenditureId !== virtualExpenditureAction.payload.expenditureId
      )
    };
  }
  return {
    ...state,
    virtualExpenditureActions: [
      ...state.virtualExpenditureActions,
      virtualExpenditureAction
    ]
  };
}
