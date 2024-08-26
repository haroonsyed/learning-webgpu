import { EventEnum } from "./event_enums";
import { System } from "./system";

type MouseState = {
  x: number;
  y: number;
  dx: number;
  dy: number;
  left: boolean;
  right: boolean;
  middle: boolean;
  left_click: boolean;
  right_click: boolean;
  middle_click: boolean;
};

class SystemInputHandler {
  key_state: Map<string, boolean>;
  key_press: Map<string, boolean>;
  mouse_state: MouseState;

  constructor() {
    this.key_state = new Map<string, boolean>();
    this.key_press = new Map<string, boolean>();
    this.mouse_state = {
      x: 0,
      y: 0,
      dx: 0,
      dy: 0,
      left: false,
      right: false,
      middle: false,
      left_click: false,
      right_click: false,
      middle_click: false,
    };

    // Init external listeners
    window.addEventListener("keydown", (e) => {
      this.key_state.set(e.key, true);

      System.event_system.publish(EventEnum.EVENT_KEY_DOWN, this);
    });
    window.addEventListener("keyup", (e) => {
      this.key_state.set(e.key, false);

      System.event_system.publish(EventEnum.EVENT_KEY_UP, this);
    });
    window.addEventListener("keypress", (e) => {
      this.key_press.set(e.key, true);

      System.event_system.publish(EventEnum.EVENT_KEY_PRESS, this);
    });
    window.addEventListener("mousemove", (e) => {
      this.mouse_state.dx = e.movementX;
      this.mouse_state.dy = e.movementY;
      this.mouse_state.x = e.x;
      this.mouse_state.y = e.y;

      System.event_system.publish(EventEnum.EVENT_MOUSE_MOVE, this);
    });
    window.addEventListener("mousedown", (e) => {
      if (e.button === 0) {
        this.mouse_state.left = true;
      } else if (e.button === 1) {
        this.mouse_state.middle = true;
      } else if (e.button === 2) {
        this.mouse_state.right = true;
      }

      System.event_system.publish(EventEnum.EVENT_MOUSE_DOWN, this);
    });
    window.addEventListener("mouseup", (e) => {
      if (e.button === 0) {
        this.mouse_state.left = false;
      } else if (e.button === 1) {
        this.mouse_state.middle = false;
      } else if (e.button === 2) {
        this.mouse_state.right = false;
      }

      System.event_system.publish(EventEnum.EVENT_MOUSE_UP, this);
    });
    window.addEventListener("click", (e) => {
      if (e.button === 0) {
        this.mouse_state.left_click = true;
      } else if (e.button === 1) {
        this.mouse_state.middle_click = true;
      } else if (e.button === 2) {
        this.mouse_state.right_click = true;
      }

      System.event_system.publish(EventEnum.EVENT_MOUSE_CLICK, this);
    });

    // Init internal listeners
    System.event_system.subscribe(EventEnum.EVENT_LOOP_END, async () => {
      this.key_press.clear();
      this.mouse_state.dx = 0;
      this.mouse_state.dy = 0;
      this.mouse_state.left_click = false;
      this.mouse_state.right_click = false;
      this.mouse_state.middle_click = false;
    });
  }
}

export { SystemInputHandler };
