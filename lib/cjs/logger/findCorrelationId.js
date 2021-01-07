"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findCorrelationId = void 0;
const common_types_1 = require("common-types");
/**
 * Looks for a Correlation ID in:
 *
 * - AWS Gateway headers (if they exist),
 * - in a `headers` property of the **body** (if it exists)
 */
function findCorrelationId(event, ctx) {
    var _a, _b, _c;
    const lookIn = [
        "X-Correlation-Id",
        "x-correlation-id",
        "@x-correlation-id",
        "@X-Correlation-Id",
    ];
    let result;
    if (common_types_1.isLambdaProxyRequest(event)) {
        for (const key of lookIn) {
            if (Object.keys(event.headers).includes(key)) {
                result = ((_a = event.headers) === null || _a === void 0 ? void 0 : _a[key]) ? (_b = event.headers) === null || _b === void 0 ? void 0 : _b[key]
                    : result;
            }
        }
    }
    if (result) {
        return result;
    }
    const body = JSON.parse(event.body || {});
    if (typeof body === "object" && event.headers) {
        for (const key of lookIn) {
            if (Object.keys(body.headers).includes(key)) {
                result = (_c = body.headers) === null || _c === void 0 ? void 0 : _c[key];
            }
        }
    }
    return result ? result : false;
}
exports.findCorrelationId = findCorrelationId;
