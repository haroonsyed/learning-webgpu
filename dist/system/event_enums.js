"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventEnum = void 0;
var EventEnum;
(function (EventEnum) {
    EventEnum[EventEnum["SCENE_FRAME_START"] = 0] = "SCENE_FRAME_START";
    EventEnum[EventEnum["SCENE_FRAME_END"] = 1] = "SCENE_FRAME_END";
    EventEnum[EventEnum["SCENE_UPDATE_START"] = 2] = "SCENE_UPDATE_START";
    EventEnum[EventEnum["SCENE_UPDATE_END"] = 3] = "SCENE_UPDATE_END";
    EventEnum[EventEnum["SCENE_RENDER_START"] = 4] = "SCENE_RENDER_START";
    EventEnum[EventEnum["SCENE_RENDER_END"] = 5] = "SCENE_RENDER_END";
})(EventEnum || (exports.EventEnum = EventEnum = {}));
//# sourceMappingURL=event_enums.js.map