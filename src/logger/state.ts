import { LogLevel, IAwsLogContext, IAwsLog, IEnvStage } from "../types";
import { IDictionary } from "common-types";
import { logLevelLookup } from "../logger";
import { loggingApi } from "./logging-api";
import { lambda } from "./lambda";
import { sample } from "../shared/sample";

export interface IAwsLogState {
  correlationId: string;
  kind:
    | "lambda"
    /** this is effectively Lambda metrics */
    | "report"
    | "browser-log"
    | "brower-metrics"
    | "browser-event"
    | "performance-test"
    | "devops";
  severity: LogLevel;
  stage: IEnvStage;
  region?: string;
  context: IAwsLogContext;
  localContext: IDictionary;
}

const defaultState: IAwsLogState = {
  context: { logger: "aws-log" },
  kind: "lambda",
  localContext: {},
  correlationId: "",
  stage: (process.env.AWS_STAGE ||
    process.env.NODE_ENV ||
    "unknown") as IEnvStage,
  region: process.env.AWS_REGION || "unknown",
  severity: undefined,
};

let archivedState: IAwsLogState;
let activeState: IAwsLogState = { ...defaultState };

const rootProperties = () =>
  ({
    correlationId: activeState.correlationId,
    stage: activeState.stage || "unknown",
    region: activeState.region || "unknown",
  } as Partial<IAwsLog>);

/**
 * Set the "context" which are properties sent with
 * every request and hanging off the "context" property
 */
export function setContext(ctx: IDictionary) {
  activeState["context"] = {
    ...ctx,
    ...defaultState["context"],
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

/** gets the logging context */
export const getContext = () => {
  const envContext = {
    awsRegion:
      process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "unknown",
    stage:
      process.env.ENVIRONMENT ||
      process.env.STAGE ||
      process.env.AWS_STAGE ||
      "unknown",
  };
  const context = { ...activeState["context"], ...envContext };

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

export function setStage(stage: IEnvStage) {
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
  activeState = { ...defaultState };
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

  setSeverity(
    !Number.isNaN(Number(s)) ? Number(s) : logLevelLookup[s.toUpperCase()]
  );
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
  reloadContext: restoreState,
};

let _sessionSampling: "all" | "none";

export function getSessionSampling() {
  if (!_sessionSampling) {
    _sessionSampling = sample();
  }
  return _sessionSampling;
}
