import { checkMaximumDurationOfUninterruptedWork } from "./rules";

describe("rules", () => {
  describe("checkMaximumDurationOfUninterruptedWork", () => {
    it("should succeed if activities is empty", () => {
      const activities = [];
      const result = checkMaximumDurationOfUninterruptedWork(activities);
      expect(result.status).toBe(1);
      expect(result.rule).toBe("maximumUninterruptedWorkTime");
    });
  });
});
