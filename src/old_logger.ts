import * as context from "./context";
import { IDictionary, ILambdaSuccessCallback } from "common-types";
import * as stack from "stack-trace";

function log(
  levelName: keyof typeof LogLevel,
  message: string,
  /** contextual parameters for the logging, if this is an error or warning you can just include the error here */
  params?: IDictionary,
  /** if you have an error and want to keep it separate from the params paramater you can include it here */
  error?: IDictionary
) {
  if (!isEnabled(LogLevels[levelName])) {
    return;
  }

  let logMsg: IDictionary = {
    message,
    level: levelName,
    ...context.get(),
    ...(params || {})
  };

  const stackTrace = stack.get() as stack.StackFrame[];
  logMsg.fn = stackTrace[2].getFunctionName().replace("exports.", "");

  if (levelName === "WARN" || levelName === "ERROR") {
    if (!error) {
      error = params;
    }
    logMsg.errorType = error.name;
    delete logMsg.name;
    logMsg.errorMessage = error.message;
    if (error.stack) {
      logMsg.stackTrace = error.stack || new Error().stack.slice(-2);
      delete logMsg.stack;
    }
  }

  console.log(JSON.stringify(logMsg, null, 1));
}

export const enableDebug = () => {
  const oldLevel = process.env.log_level;
  process.env.log_level = "DEBUG";

  // return a function to perform the rollback
  return () => {
    process.env.log_level = oldLevel;
  };
};

export const debug = (msg: string, params?: IDictionary) => log("DEBUG", msg, params);
export const info = (msg: string, params?: IDictionary) => log("INFO", msg, params);
export const warn = (msg: string, paramsOrErr?: IDictionary, err?: IDictionary) =>
  log("WARN", msg, paramsOrErr, err);
export const error = (
  msgOrError: string | IDictionary,
  paramsOrErr?: IDictionary,
  err?: IDictionary
) => {
  const msg: string = typeof msgOrError === "object" ? msgOrError.message : msgOrError;
  const error: IDictionary = typeof msgOrError === "object" && !err ? msgOrError : err;

  log("ERROR", msg, paramsOrErr, error);
};

export const initLogger = (request: IDictionary, reqContext: IDictionary) => {
  context.originateCorrelationId(request, reqContext);
  info(`Starting handler for ${context.get().functionName}`, {
    request,
    reqContext,
    kind: "request"
  });
};

export const response = (fn: ILambdaSuccessCallback, response: IDictionary) => {
  const payload = {
    kind: "response",
    "x-correlation-id": context.get()["x-correlation-id"] || null,
    ...response
  };

  info(`Handler for ${context.get().functionName} is returning`, payload);

  fn(null, payload);
};

export const getContext = context.get;
export const setContext = context.set;
export const addToContext = context.add;
export const removeFromContext = context.remove;
