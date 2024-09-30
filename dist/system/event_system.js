"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameEventSystem = void 0;
class GameEventSystem {
    constructor() {
        this.events = new Map();
    }
    subscribe(event_name, callback) {
        if (!this.events.has(event_name)) {
            this.events.set(event_name, []);
        }
        if (this.events.get(event_name).includes(callback)) {
            return callback; // Already subscribed
        }
        this.events.get(event_name).push(callback);
        return callback;
    }
    unsubscribe(event_name, callback) {
        var _a;
        const event_callbacks = this.events.get(event_name);
        const index = (_a = event_callbacks === null || event_callbacks === void 0 ? void 0 : event_callbacks.indexOf(callback)) !== null && _a !== void 0 ? _a : -1;
        if (index >= 0) {
            event_callbacks.splice(index, 1);
        }
    }
    publish(event_name_1) {
        return __awaiter(this, arguments, void 0, function* (event_name, data = {}) {
            if (!this.events.has(event_name)) {
                return;
            }
            const event_callbacks = this.events.get(event_name);
            const promises = event_callbacks.map((callback) => callback(data));
            yield Promise.all(promises);
        });
    }
}
exports.GameEventSystem = GameEventSystem;
//# sourceMappingURL=event_system.js.map