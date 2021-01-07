"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lambda = void 0;
const state_1 = require("./state");
const findCorrelationId_1 = require("./findCorrelationId");
const createCorrelationId_1 = require("./createCorrelationId");
const logging_api_1 = require("./logging-api");
function lambda(event, ctx, options = {}) {
    state_1.setCorrelationId(findCorrelationId_1.findCorrelationId(event, ctx) || createCorrelationId_1.createCorrelationId());
    state_1.setContext(ctx);
    state_1.setLocalContext(options);
    return logging_api_1.loggingApi;
}
exports.lambda = lambda;
