"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const state_1 = require("./state");
const correlationId_1 = require("./correlationId");
const logging_api_1 = require("./logging-api");
function lambda(event, ctx, options = {}) {
    state_1.setCorrelationId(correlationId_1.findCorrelationId(event, ctx) || correlationId_1.createCorrelationId());
    state_1.setContext(ctx);
    state_1.setLocalContext(options);
    return logging_api_1.loggingApi;
}
exports.lambda = lambda;
