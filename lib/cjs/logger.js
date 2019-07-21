"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logging_api_1 = require("./logger/logging-api");
const state_1 = require("./logger/state");
const correlationId_1 = require("./logger/correlationId");
const sessionSample_1 = require("./shared/sessionSample");
var state_2 = require("./logger/state");
exports.setSeverity = state_2.setSeverity;
exports.setContext = state_2.setContext;
exports.getState = state_2.getState;
exports.logLevelLookup = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3
};
const defaultConfigs = {
    dev: {
        debug: "all",
        info: "all",
        warn: "all",
        error: "all"
    },
    test: {
        debug: "all",
        info: "all",
        warn: "all",
        error: "all"
    },
    stage: {
        debug: "none",
        info: "sample-by-session",
        warn: "all",
        error: "all"
    },
    prod: {
        debug: "none",
        info: "sample-by-session",
        warn: "all",
        error: "all"
    }
};
function logger(requestedConfig) {
    const environment = process.env.AWS_STAGE || "dev";
    const defaultConfig = defaultConfigs[environment];
    if (requestedConfig) {
        exports.config = sessionSample_1.sessionSample(Object.assign({}, defaultConfig, requestedConfig));
    }
    else {
        exports.config = defaultConfig;
    }
    state_1.clearState();
    state_1.initSeverity();
    state_1.setCorrelationId(correlationId_1.createCorrelationId());
    return Object.assign({}, logging_api_1.loggingApi, state_1.contextApi);
}
exports.logger = logger;
