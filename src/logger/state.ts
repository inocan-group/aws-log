import { LogLevel, IAwsLogContext } from "../types";
import { IDictionary } from "common-types";
import { logLevelLookup } from "../logger";
import { loggingApi } from "./logging-api";
import { lambda } from "./lambda";

export interface IAwsLogState {
  correlationId: string;
  severity: LogLevel;
  context: IAwsLogContext;
  localContext: IDictionary;
}

const defaultState: IAwsLogState = {
  context: { logger: "aws-log" },
  localContext: {},
  correlationId: "",
  severity: undefined
};

let archivedState: IAwsLogState;
let activeState: IAwsLogState = { ...defaultState };

let rootProperties = () => ({
  "@x-correlation-id": activeState.correlationId,
  "@severity": activeState.severity
});

/**
 * Set the "context" which are properties sent with
 * every request and hanging off the "context" property
 */
export function setContext(ctx: IDictionary) {
  activeState.context = {
    ...ctx,
    ...defaultState.context
  };

  return loggingApi;
}

/**
 * Sets a localized context, this is a set of properties which are included
 * as part of the base properties of the message. Where the local logging has
 * a conflicting property name the local logging will overwrite this context
 */
export function setLocalContext(ctx: IDictionary) {
  activeState.localContext = ctx;

  return loggingApi;
}

/**
 * Allows the local context to be added to after the intial setting
 */
export function addToLocalContext(ctx: IDictionary) {
  activeState.localContext = { ...activeState.localContext, ...ctx };

  return loggingApi;
}

export function getState() {
  return activeState;
}

/** comment */
export const getContext = () => {
  const envContext = {
    awsRegion: process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "unknown",
    stage:
      process.env.ENVIRONMENT || process.env.STAGE || process.env.AWS_STAGE || "unknown"
  };
  const context = { ...activeState.context, ...envContext };

  return context as IAwsLogContext;
};

export function getLocalContext() {
  return activeState.localContext || {};
}

export function getCorrelationId() {
  return activeState.correlationId;
}

export function setCorrelationId(id: string) {
  activeState.correlationId = id;
}

export function getRootProperties() {
  return rootProperties();
}

export function clearState() {
  archiveState(activeState);
  activeState = { ...defaultState };
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

export function setSeverity(s: LogLevel) {
  activeState.severity = s;
}

export function getSeverity() {
  return activeState.severity;
}

function archiveState(state: IAwsLogState) {
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
