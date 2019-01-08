import {
  IDictionary,
  IAWSLambdaProxyIntegrationRequest,
  IAWSLambaContext
} from "common-types";
import * as stack from "stack-trace";
import { IAwsLogContext, IAwsLog } from "./types";

const LogLevelLookup: IDictionary<number> = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

export enum LogLevel {
  debug,
  info,
  warn,
  error
}

let severity: LogLevel = LogLevel.info;
let correlationId: string = "";

let rootProperties = () => ({
  "@x-correlation-id": correlationId,
  "@severity": severity
});

let context: IAwsLogContext = { logger: "aws-log" };

function createCorrelationId(): string {
  return (
    "c-" +
    Math.random()
      .toString(36)
      .substr(2, 10)
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

function getSeverity(): number {
  const s = process.env.LOG_LEVEL;

  if (!s) {
    return LogLevel.info; // default value
  }

  return !Number.isNaN(Number(s)) ? Number(s) : LogLevelLookup[s.toUpperCase()];
}

const loggingApi = {
  log: info,
  debug,
  info,
  warn,
  error
};

const contextApi = {
  context: setContext,
  lambda
};

export function logger() {
  severity = getSeverity();
  correlationId = createCorrelationId();
  context = { logger: "aws-log" };
  return { ...loggingApi, ...contextApi };
}

function stdout(msg: string | IDictionary) {
  if (process.env.LOG_TESTING) {
    return typeof msg === "string" ? JSON.parse(msg) : msg;
  } else {
    console.log(typeof msg === "string" ? msg : JSON.stringify(msg, null, 2));
  }
}

/**
 * If the context object passed in contains a "context" property
 * move it out of the way so it doesn't collide with
 */
function avoidContextCollision(options: IDictionary) {
  if (options.context) {
    options["_context"] = options.context;
    delete options.context;
  }

  return options;
}

function debug(message: string, params: IDictionary = {}) {
  if (severity === LogLevel.debug) {
    return stdout({
      ...{ message, context },
      ...avoidContextCollision(params)
    });
  }
}

function info(message: string, params: IDictionary = {}) {
  if (severity <= LogLevel.info) {
    return stdout({
      ...{ message, context },
      ...avoidContextCollision(params)
    });
  }
}

function warn(message: string, params: IDictionary = {}) {
  if (severity <= LogLevel.warn) {
    return stdout({
      ...{ message, context },
      ...avoidContextCollision(params)
    });
  }
}

function error(
  msgOrError: string | IDictionary,
  paramsOrErr?: IDictionary,
  err?: IDictionary
) {
  // errors are logged at all log levels
}

export type ILambdaEvent<T = IDictionary> =
  | IAWSLambdaProxyIntegrationRequest
  | T;

function lambda(
  event: ILambdaEvent,
  ctx: IAWSLambaContext,
  options: IDictionary = {}
) {
  correlationId = findCorrelationId(event, ctx) || createCorrelationId();
  const severity = getSeverity();

  context = {
    ...options,
    ...ctx,
    ...{ logger: "aws-log" }
  };

  return loggingApi;
}

function setContext(ctx: IDictionary) {
  context = {
    ...ctx,
    ...{ logger: "aws-log" }
  };

  return loggingApi;
}

export function setSeverity(s: LogLevel) {
  severity = s;
}

export function getLoggerConfig() {
  return {
    correlationId,
    severity,
    context
  };
}
