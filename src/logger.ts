import { IDictionary } from "common-types";
import { info, debug, warn, error } from "./logger/logging-api";
import { lambda } from "./logger/lambda";
import {
  setContext as context,
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
  /** an alias for the "info" level of logging */
  log: info,
  /** the most verbose level of logging, usually reserved for debugging purposes only */
  debug,
  /** informational messages about the state of the application/function/etc */
  info,
  /** messages which represent a concern or possible concern */
  warn,
  /** reserved for when a known error is encountered; beyond basic messaging the stack trace will passed along to stdout */
  error
};

export const contextApi = {
  /** set the context for logging with any hash object */
  context,
  /** set the context for logging with the Lambda event and context */
  lambda,
  /** allow for reloading context to last known point */
  reloadContext
};

export function logger() {
  clearState();
  initSeverity();
  setCorrelationId(createCorrelationId());

  return { ...loggingApi, ...contextApi };
}
