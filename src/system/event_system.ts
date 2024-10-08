type EventCallBack = (data: any) => Promise<void>;

class GameEventSystem {
  private events: Map<string, EventCallBack[]>;

  constructor() {
    this.events = new Map<string, EventCallBack[]>();
  }

  subscribe(event_name: string, callback: EventCallBack) {
    if (!this.events.has(event_name)) {
      this.events.set(event_name, []);
    }

    if (this.events.get(event_name)!.includes(callback)) {
      return callback; // Already subscribed
    }

    this.events.get(event_name)!.push(callback);
    return callback;
  }

  unsubscribe(event_name: string, callback: EventCallBack) {
    const event_callbacks = this.events.get(event_name)!;
    const index = event_callbacks?.indexOf(callback) ?? -1;

    if (index >= 0) {
      event_callbacks.splice(index, 1);
    }
  }

  async publish(event_name: string, data: any = {}) {
    if (!this.events.has(event_name)) {
      return;
    }

    const event_callbacks = this.events.get(event_name)!;
    const promises = event_callbacks.map((callback) => callback(data));
    await Promise.all(promises);
  }
}

export { GameEventSystem, EventCallBack };
