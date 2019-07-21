"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function createCorrelationId() {
    return ("c-" +
        Math.random()
            .toString(36)
            .substr(2, 16));
}
exports.createCorrelationId = createCorrelationId;
/**
 * Looks in various places to find an existing correlationId
 */
function findCorrelationId(event, context) {
    return event.headers && event.headers["@x-correlation-id"]
        ? event.headers["@x-correlation-id"]
        : event.headers && event.headers["x-correlation-id"]
            ? event.headers && event.headers["x-correlation-id"]
            : false;
}
exports.findCorrelationId = findCorrelationId;
