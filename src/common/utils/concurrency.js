export class NonConcurrentExecutionQueue {
  constructor() {
    this.queue = [];
    this.lock = false;
  }

  execute = func => {
    return new Promise((resolve, reject) => {
      const executeOperation = async () => {
        this.lock = true;
        let response, error;
        try {
          response = await func();
        } catch (err) {
          error = err;
        }
        if (this.queue.length === 0) {
          this.lock = false;
        } else {
          this.queue[0]();
          this.queue = this.queue.slice(1);
        }
        return error ? reject(error) : resolve(response);
      };
      if (!this.lock) {
        executeOperation();
      } else {
        this.queue.push(executeOperation);
      }
    });
  };

  clear = () => {
    this.queue = [];
    this.lock = false;
  };
}
