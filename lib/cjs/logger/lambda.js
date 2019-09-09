"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
function lambda(event, ctx, options = {}) {
    index_1.setCorrelationId(index_1.findCorrelationId(event, ctx) || index_1.createCorrelationId());
    index_1.setContext(ctx);
    index_1.setLocalContext(options);
    return index_1.loggingApi;
}
exports.lambda = lambda;
