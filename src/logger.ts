import { IDictionary } from "common-types";
import { info, debug, warn, error } from "./logger/logging-api";
import { lambda } from "./logger/lambda";
import {
  setContext,
  getState,
  initSeverity,
  setCorrelationId,
  clearState,
  restoreState
} from "./logger/state";
import { createCorrelationId } from "./logger/correlationId";
export { setSeverity, setContext, getState } from "./logger/state";

export const logLevelLookup: IDictionary<number> = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

export const loggingApi = {
  log: info,
  debug,
  info,
  warn,
  error
};

export const contextApi = {
  context: setContext,
  lambda,
  reloadContext: restoreState
};

export function logger() {
  clearState();
  initSeverity();
  setCorrelationId(createCorrelationId());

  return { ...loggingApi, ...contextApi };
}
