import { IDictionary } from "common-types";
import { info, debug, warn, error } from "./logger/logging-api";
import { lambda } from "./logger/lambda";
import {
  setContext as context,
  getState,
  initSeverity,
  setCorrelationId,
  clearState,
  restoreState as reloadContext
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
  /** set the context for logging with any hash object */
  context,
  /** set the context for logging with the Lambda event and context */
  lambda,
  reloadContext
};

export function logger() {
  clearState();
  initSeverity();
  setCorrelationId(createCorrelationId());

  return { ...loggingApi, ...contextApi };
}
