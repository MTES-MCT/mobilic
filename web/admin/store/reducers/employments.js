import { now } from "common/utils/time";

export function updateEmploymentsLatestInvitateEmailTimeReducer(
  state,
  { employmentIds }
) {
  return {
    ...state,
    employments: state.employments.map(emp =>
      employmentIds.includes(emp.id)
        ? { ...emp, latestInviteEmailTime: now() }
        : emp
    )
  };
}
