import {
  IDictionary,
  IAWSLambdaProxyIntegrationRequest,
  IAWSLambaContext
} from "common-types";
import { loggingApi } from "./logger/logging-api";
import {
  setContext,
  setSeverity,
  getState,
  initSeverity,
  setCorrelationId,
  getCorrelationId
} from "./logger/state";
export { setSeverity, setContext, getState } from "./logger/state";

export const logLevelLookup: IDictionary<number> = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

function createCorrelationId(): string {
  return (
    "c-" +
    Math.random()
      .toString(36)
      .substr(2, 16)
  );
}

/**
 * Looks in various places to find an existing correlationId
 */
function findCorrelationId(
  event: ILambdaEvent,
  context: IAWSLambaContext
): string | false {
  return event.headers && event.headers["@x-correlation-id"]
    ? event.headers["@x-correlation-id"]
    : event.headers && event.headers["x-correlation-id"]
    ? event.headers && event.headers["x-correlation-id"]
    : false;
}

const contextApi = {
  context: setContext,
  lambda
};

export function logger() {
  initSeverity();
  setCorrelationId(createCorrelationId());

  return { ...loggingApi, ...contextApi };
}

export type ILambdaEvent<T = IDictionary> =
  | IAWSLambdaProxyIntegrationRequest
  | T;

function lambda(
  event: ILambdaEvent,
  ctx: IAWSLambaContext,
  options: IDictionary = {}
) {
  setCorrelationId(findCorrelationId(event, ctx) || createCorrelationId());

  setContext({
    ...options,
    ...ctx,
    ...{ logger: "aws-log" }
  });

  return loggingApi;
}

export function getLoggerConfig() {
  return getState();
}
