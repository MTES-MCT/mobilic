import { LOCAL_STORAGE_SCHEMA } from "./schemas";
import { Map } from "./types";
import pickBy from "lodash/pickBy";
import mapValues from "lodash/mapValues";
import { resolveLatestVersion } from "./offline";
import { EMPLOYMENT_STATUS, getEmploymentsStatus } from "../utils/employments";

export function entitySelector(entity) {
  return state => {
    if (LOCAL_STORAGE_SCHEMA[entity] !== Map) return state[entity];

    return pickBy(
      mapValues(state[entity], item => resolveLatestVersion(item)),
      value => !!value
    );
  };
}

function orderEmployments(employments) {
  return employments.sort((e1, e2) => {
    const status1 = getEmploymentsStatus(e1);
    const status2 = getEmploymentsStatus(e2);

    if (
      status1 === EMPLOYMENT_STATUS.ended &&
      status2 !== EMPLOYMENT_STATUS.ended
    )
      return 1;
    if (
      status1 !== EMPLOYMENT_STATUS.ended &&
      status2 === EMPLOYMENT_STATUS.ended
    )
      return -1;
    return e1.startDate < e2.startDate ? 1 : -1;
  });
}

export function employmentSelector(state) {
  return orderEmployments(entitySelector("employments")(state));
}
