import { EventEnum } from "./event_enums";
type EventCallBack = (data: any) => Promise<void>;
declare class GameEventSystem {
    private events;
    constructor();
    subscribe(event_name: EventEnum, callback: EventCallBack): EventCallBack;
    unsubscribe(event_name: EventEnum, callback: EventCallBack): void;
    publish(event_name: EventEnum, data?: any): Promise<void>;
}
export { GameEventSystem, EventCallBack };
