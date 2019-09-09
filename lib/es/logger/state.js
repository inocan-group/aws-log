import { LogLevel } from "../types";
import { logLevelLookup } from "../logger";
import { loggingApi } from "./logging-api";
import { lambda } from "./lambda";
import { sample } from "../shared/sample";
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
export function setContext(ctx) {
    activeState["context"] = Object.assign(Object.assign({}, ctx), defaultState["context"]);
    return loggingApi;
}
/**
 * Sets a localized context, this is a set of properties which are included
 * as part of the base properties of the message. Where the local logging has
 * a conflicting property name the local logging will overwrite this context
 */
export function setLocalContext(ctx) {
    activeState.localContext = ctx;
    return loggingApi;
}
/**
 * Allows the local context to be added to after the intial setting
 */
export function addToLocalContext(ctx) {
    activeState.localContext = Object.assign(Object.assign({}, activeState.localContext), ctx);
    return loggingApi;
}
export function getState() {
    return activeState;
}
/** gets the logging context */
export const getContext = () => {
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
export function getLocalContext() {
    return activeState.localContext || {};
}
export function getCorrelationId() {
    return activeState.correlationId;
}
export function setCorrelationId(id) {
    activeState.correlationId = id;
}
export function setStage(stage) {
    activeState.stage = stage;
}
export function getStage() {
    return activeState.stage;
}
export function getRootProperties() {
    return rootProperties();
}
export function clearState() {
    archiveState(activeState);
    activeState = Object.assign({}, defaultState);
    _sessionSampling = undefined;
}
export function restoreState() {
    activeState = archivedState || defaultState;
    return loggingApi;
}
export function initSeverity() {
    const s = process.env.LOG_LEVEL;
    if (!s) {
        setSeverity(LogLevel.info);
        return;
    }
    setSeverity(!Number.isNaN(Number(s)) ? Number(s) : logLevelLookup[s.toUpperCase()]);
}
export function setSeverity(s) {
    activeState.severity = s;
}
export function getSeverity() {
    return activeState.severity;
}
function archiveState(state) {
    archivedState = state;
}
export const contextApi = {
    /** set the context for logging with any hash object */
    context: setContext,
    /** set the context for logging with the Lambda event and context */
    lambda,
    /** allow for reloading context to last known point */
    reloadContext: restoreState
};
let _sessionSampling;
export function getSessionSampling() {
    if (!_sessionSampling) {
        _sessionSampling = sample();
    }
    return _sessionSampling;
}
