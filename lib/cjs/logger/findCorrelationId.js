"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Looks in various places to find an existing `correlationId`
 */
function findCorrelationId(event, headers) {
    const lookIn = [
        "X-Correlation-Id",
        "x-correlation-id",
        "@x-correlation-id",
        "@X-Correlation-Id"
    ];
    if (headers) {
        let result = false;
        let idx = 0;
        while (!result && idx <= lookIn.length - 1) {
            if (headers[lookIn[idx]]) {
                result = headers[lookIn[idx]];
            }
            idx++;
        }
        if (result) {
            return result;
        }
    }
    if (event.headers) {
        let result = false;
        let idx = 0;
        while (!result && idx <= lookIn.length - 1) {
            if (event.headers[lookIn[idx]]) {
                result = event.headers[lookIn[idx]];
            }
            idx++;
        }
        if (result) {
            return result;
        }
    }
    if (typeof event === "object") {
        let result = false;
        let idx = 0;
        while (!result && idx <= lookIn.length - 1) {
            if (event[lookIn[idx]]) {
                result = event[lookIn[idx]];
            }
            idx++;
        }
        if (result) {
            return result;
        }
    }
    return false;
}
exports.findCorrelationId = findCorrelationId;
