"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../types");
const logger_1 = require("../logger");
const logging_api_1 = require("./logging-api");
const lambda_1 = require("./lambda");
const sample_1 = require("../shared/sample");
const defaultState = {
    context: { logger: "aws-log" },
    kind: "lambda",
    localContext: {},
    correlationId: "",
    stage: (process.env.AWS_STAGE ||
        process.env.NODE_ENV ||
        "unknown"),
    region: process.env.AWS_REGION || "unknown",
    severity: undefined
};
let archivedState;
let activeState = Object.assign({}, defaultState);
let rootProperties = () => ({
    correlationId: activeState.correlationId,
    stage: activeState.stage || "unknown",
    region: activeState.region || "unknown"
});
/**
 * Set the "context" which are properties sent with
 * every request and hanging off the "context" property
 */
function setContext(ctx) {
    activeState["context"] = Object.assign(Object.assign({}, ctx), defaultState["context"]);
    return logging_api_1.loggingApi;
}
exports.setContext = setContext;
/**
 * Sets a localized context, this is a set of properties which are included
 * as part of the base properties of the message. Where the local logging has
 * a conflicting property name the local logging will overwrite this context
 */
function setLocalContext(ctx) {
    activeState.localContext = ctx;
    return logging_api_1.loggingApi;
}
exports.setLocalContext = setLocalContext;
/**
 * Allows the local context to be added to after the intial setting
 */
function addToLocalContext(ctx) {
    activeState.localContext = Object.assign(Object.assign({}, activeState.localContext), ctx);
    return logging_api_1.loggingApi;
}
exports.addToLocalContext = addToLocalContext;
function getState() {
    return activeState;
}
exports.getState = getState;
/** gets the logging context */
exports.getContext = () => {
    const envContext = {
        awsRegion: process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "unknown",
        stage: process.env.ENVIRONMENT ||
            process.env.STAGE ||
            process.env.AWS_STAGE ||
            "unknown"
    };
    const context = Object.assign(Object.assign({}, activeState["context"]), envContext);
    return context;
};
function getLocalContext() {
    return activeState.localContext || {};
}
exports.getLocalContext = getLocalContext;
function getCorrelationId() {
    return activeState.correlationId;
}
exports.getCorrelationId = getCorrelationId;
function setCorrelationId(id) {
    activeState.correlationId = id;
}
exports.setCorrelationId = setCorrelationId;
function setStage(stage) {
    activeState.stage = stage;
}
exports.setStage = setStage;
function getStage() {
    return activeState.stage;
}
exports.getStage = getStage;
function getRootProperties() {
    return rootProperties();
}
exports.getRootProperties = getRootProperties;
function clearState() {
    archiveState(activeState);
    activeState = Object.assign({}, defaultState);
    _sessionSampling = undefined;
}
exports.clearState = clearState;
function restoreState() {
    activeState = archivedState || defaultState;
    return logging_api_1.loggingApi;
}
exports.restoreState = restoreState;
function initSeverity() {
    const s = process.env.LOG_LEVEL;
    if (!s) {
        setSeverity(types_1.LogLevel.info);
        return;
    }
    setSeverity(!Number.isNaN(Number(s)) ? Number(s) : logger_1.logLevelLookup[s.toUpperCase()]);
}
exports.initSeverity = initSeverity;
function setSeverity(s) {
    activeState.severity = s;
}
exports.setSeverity = setSeverity;
function getSeverity() {
    return activeState.severity;
}
exports.getSeverity = getSeverity;
function archiveState(state) {
    archivedState = state;
}
exports.contextApi = {
    /** set the context for logging with any hash object */
    context: setContext,
    /** set the context for logging with the Lambda event and context */
    lambda: lambda_1.lambda,
    /** allow for reloading context to last known point */
    reloadContext: restoreState
};
let _sessionSampling;
function getSessionSampling() {
    if (!_sessionSampling) {
        _sessionSampling = sample_1.sample();
    }
    return _sessionSampling;
}
exports.getSessionSampling = getSessionSampling;
