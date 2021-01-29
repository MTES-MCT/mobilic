import minBy from "lodash/minBy";
import omit from "lodash/omit";

export class MaxSizeCache {
  constructor(maxSize) {
    this.maxSize = maxSize;
    this.items = {};
  }

  get = (key, notBefore = null) =>
    this.items[key]
      ? !notBefore || this.items[key].time >= notBefore
        ? this.items[key].value
        : null
      : null;

  add = (key, value) => {
    this.items[key] = {
      time: Date.now(),
      value
    };
    const itemList = Object.entries(this.items);
    if (itemList.length > this.maxSize) {
      const oldestItem = minBy(itemList, ([k, v]) => v.time);
      this.items = omit(this.items, [oldestItem[0]]);
    }
  };
}
