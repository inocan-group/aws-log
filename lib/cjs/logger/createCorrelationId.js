"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCorrelationId = void 0;
function createCorrelationId() {
    return ("c-" +
        Math.random()
            .toString(36)
            .substr(2, 16));
}
exports.createCorrelationId = createCorrelationId;
