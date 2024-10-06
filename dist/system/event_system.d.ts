type EventCallBack = (data: any) => Promise<void>;
declare class GameEventSystem {
    private events;
    constructor();
    subscribe(event_name: string, callback: EventCallBack): EventCallBack;
    unsubscribe(event_name: string, callback: EventCallBack): void;
    publish(event_name: string, data?: any): Promise<void>;
}
export { GameEventSystem, EventCallBack };
