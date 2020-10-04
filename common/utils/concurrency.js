export class NonConcurrentExecutionQueue {
  constructor(maxQueueSize) {
    this.queue = [];
    this.actualQueueSize = 0;
    this.maxQueueSize = maxQueueSize;
  }

  execute = func => {
    return new Promise((resolve, reject) => {
      const executeOperation = async (
        func,
        decrementActualQueueSize = true
      ) => {
        let response, error;
        try {
          response = await func();
        } catch (err) {
          error = err;
        }

        // Take out the task from the queue
        if (decrementActualQueueSize && this.actualQueueSize > 0) {
          this.actualQueueSize = this.actualQueueSize - 1;
        }
        this.queue = this.queue.slice(1);

        // Start the next task if it exists
        if (this.queue.length > 0) {
          this.queue[0]();
        }
        return error ? reject(error) : resolve(response);
      };

      // Enqueue the job
      if (!this.maxQueueSize || this.actualQueueSize < this.maxQueueSize) {
        this.actualQueueSize = this.actualQueueSize + 1;
        this.queue.push(async () => await executeOperation(func));
      } else {
        this.queue.push(async () => await executeOperation(resolve, false));
      }

      // Immediately start it if the queue was empty;
      if (this.queue.length === 1) {
        this.queue[0]();
      }
    });
  };

  clear = () => {
    if (this.queue.length > 0) {
      this.queue = this.queue.slice(0, 1);
    } else this.queue = [];
    this.actualQueueSize = 0;
  };
}
