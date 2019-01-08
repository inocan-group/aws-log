import { LogLevel, IAwsLog, IAwsLogContext } from "../types";
import { IDictionary } from "common-types";
import { logLevelLookup } from "../logger";
import { loggingApi } from "./logging-api";

export interface IAwsLogState {
  correlationId: string;
  severity: LogLevel;
  context: IAwsLogContext;
}

const defaultState: IAwsLogState = {
  context: { logger: "aws-log" },
  correlationId: "",
  severity: undefined
};

let archivedState: IAwsLogState;
let activeState: IAwsLogState = { ...defaultState };

let severity: LogLevel = LogLevel.info;
let correlationId: string = "";

let rootProperties = () => ({
  "@x-correlation-id": activeState.correlationId,
  "@severity": activeState.severity
});

export function setContext(ctx: IDictionary) {
  activeState.context = {
    ...ctx,
    ...defaultState.context
  };

  return loggingApi;
}

export function getState() {
  return activeState;
}

export function getContext() {
  const envContext = {
    awsRegion: process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "unknown",
    stage: process.env.ENVIRONMENT || process.env.STAGE || process.env.AWS_STAGE || "unknown"
  }
  return {...activeState.context, ...envContext};
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
