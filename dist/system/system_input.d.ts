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
declare class SystemInputHandler {
    key_state: Map<string, boolean>;
    key_press: Map<string, boolean>;
    mouse_state: MouseState;
    constructor();
    reset(): void;
}
export { SystemInputHandler };
//# sourceMappingURL=system_input.d.ts.map