import { VIRTUAL_ACTIVITIES_ACTIONS } from "../store";
import { reduceVirtualActivities } from "./virtualActivities";

const drivePayload = {
  type: "drive",
  startTime: 1656849600,
  endTime: 1656853200,
  missionId: 5725,
  userId: 112904336,
  switch: false
};

describe("virtualActivities", () => {
  describe("reducer", () => {
    it("should add an item when creating an item", () => {
      const prevArray = [];
      const activity = {
        action: VIRTUAL_ACTIVITIES_ACTIONS.create,
        payload: drivePayload,
        activityId: 6539
      };

      const res = reduceVirtualActivities(prevArray, activity);

      expect(res.length).toBe(1);
      expect(res[0]).toMatchObject(activity);
    });
    it("should add an item at the end when creating an item", () => {
      const prevArray = [6539, 6540, 6541].map(id => {
        return {
          action: VIRTUAL_ACTIVITIES_ACTIONS.create,
          payload: drivePayload,
          activityId: id
        };
      });
      const activity = {
        action: VIRTUAL_ACTIVITIES_ACTIONS.create,
        payload: drivePayload,
        activityId: 6542
      };

      const res = reduceVirtualActivities(prevArray, activity);

      expect(res.length).toBe(4);
      expect(res[3]).toMatchObject(activity);
    });
    it("should add an item when editing existing item", () => {
      const prevArray = [
        {
          action: VIRTUAL_ACTIVITIES_ACTIONS.create,
          payload: drivePayload,
          activityId: 6454
        }
      ];
      const activity = {
        action: VIRTUAL_ACTIVITIES_ACTIONS.edit,
        payload: {
          activityId: 6456,
          startTime: 1656828000,
          endTime: 1656833400,
          removeEndTime: false
        },
        activityId: 6456
      };

      const res = reduceVirtualActivities(prevArray, activity);

      expect(res.length).toBe(2);
      expect(res[1]).toMatchObject(activity);
    });
    it("should modify and put at the end an item when editing virtual item", () => {
      const prevArray = [6450, 6451, 6452].map(id => {
        return {
          action: VIRTUAL_ACTIVITIES_ACTIONS.create,
          payload: drivePayload,
          activityId: id
        };
      });
      const activity = {
        action: VIRTUAL_ACTIVITIES_ACTIONS.edit,
        payload: {
          activityId: 6451,
          startTime: 1656828000,
          endTime: 1656833400,
          removeEndTime: false
        },
        activityId: 6451
      };

      const res = reduceVirtualActivities(prevArray, activity);

      expect(res.length).toBe(3);
      expect(res[2]).toMatchObject({
        action: VIRTUAL_ACTIVITIES_ACTIONS.create,
        activityId: 6451,
        payload: {
          startTime: 1656828000,
          endTime: 1656833400
        }
      });
    });
    it("should add an item when canceling existing item", () => {
      const prevArray = [
        {
          action: VIRTUAL_ACTIVITIES_ACTIONS.create,
          payload: drivePayload,
          activityId: 6454
        }
      ];
      const activity = {
        action: VIRTUAL_ACTIVITIES_ACTIONS.cancel,
        payload: {
          activityId: 6457
        },
        activityId: 6457
      };

      const res = reduceVirtualActivities(prevArray, activity);

      expect(res.length).toBe(2);
      expect(res[0]).toMatchObject({
        action: VIRTUAL_ACTIVITIES_ACTIONS.cancel,
        activityId: 6457
      });
    });
    it("should remove an item when canceling virtual item", () => {
      const prevArray = [
        {
          action: VIRTUAL_ACTIVITIES_ACTIONS.create,
          payload: drivePayload,
          activityId: 6454,
          virtual: true
        }
      ];
      const activity = {
        action: VIRTUAL_ACTIVITIES_ACTIONS.cancel,
        payload: {
          activityId: 6454
        },
        activityId: 6454
      };

      const res = reduceVirtualActivities(prevArray, activity);

      expect(res.length).toBe(0);
    });
    it("should keep the cancel action when canceling an edited existing activity", () => {
      const prevArray = [
        {
          action: VIRTUAL_ACTIVITIES_ACTIONS.edit,
          payload: drivePayload,
          activityId: 6454
        }
      ];
      const activity = {
        action: VIRTUAL_ACTIVITIES_ACTIONS.cancel,
        payload: {
          activityId: 6454
        },
        activityId: 6454
      };

      const res = reduceVirtualActivities(prevArray, activity);

      expect(res.length).toBe(1);
      expect(res[0]).toMatchObject({
        action: VIRTUAL_ACTIVITIES_ACTIONS.cancel,
        activityId: 6454
      });
    });
  });
});
