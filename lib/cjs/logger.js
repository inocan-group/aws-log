"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logging_api_1 = require("./logger/logging-api");
const state_1 = require("./logger/state");
const sessionSample_1 = require("./shared/sessionSample");
const createCorrelationId_1 = require("./logger/createCorrelationId");
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
        exports.config = sessionSample_1.sessionSample(Object.assign(Object.assign({}, defaultConfig), requestedConfig));
    }
    else if (exports.config === undefined) {
        exports.config = defaultConfig;
    }
    state_1.clearState();
    state_1.initSeverity();
    state_1.setCorrelationId(createCorrelationId_1.createCorrelationId());
    return Object.assign(Object.assign({}, logging_api_1.loggingApi), state_1.contextApi);
}
exports.logger = logger;
