import moment from "moment";
import { getStartOfDay, getStartOfMonth, getStartOfWeek } from "../time";

export const PERIOD_UNITS = {
  mission: {
    periodLength: moment.duration(0),
    getPeriod: date => date
  },
  day: {
    periodLength: moment.duration(1, "days"),
    getPeriod: date => getStartOfDay(date)
  },
  week: {
    getPeriod: date => getStartOfWeek(date),
    periodLength: moment.duration(1, "weeks")
  },
  month: {
    periodLength: moment.duration(1, "months"),
    getPeriod: date => getStartOfMonth(date)
  }
};
