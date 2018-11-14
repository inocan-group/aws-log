import { IDictionary } from "common-types";
export interface ILogContext extends IDictionary {
  /** a unique ID for a graph/fan of related function executions */
  "x-correlation-id"?: string;
  module?: string;
  kind?: string;
  /**
   * a way to name a series of repeated steps/functions, etc.
   */
  workflow?: string;

  awsRegion: string;
  functionName: string;
  functionVersion: string;
  functionMemorySize: string;
  stage: string;
  userAgent?: string;
}

export interface ILogBaseContext {
  awsRegion: string;
  functionName: string;
  functionVersion: string;
  functionMemorySize: string;
  stage: string;
}

/** a dictionary of attributes to include in all logging */
let _context: Partial<ILogContext> = {};
let sampleDebugLogRate = process.env.LOG_DEBUG_SAMPLING_RATE || 0.01;

function baseContext() {
  return {
    awsRegion: process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION,
    functionName: process.env.AWS_LAMBDA_FUNCTION_NAME,
    functionVersion: process.env.AWS_LAMBDA_FUNCTION_VERSION,
    functionMemorySize: process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE,
    stage: process.env.ENVIRONMENT || process.env.STAGE || process.env.AWS_STAGE
  };
}

export function add<T = any>(key: string, value: T) {
  _context[key] = value;
}

/**
 * sets the log entry context; this is a destructive call replacing
 * the input with whatever context previously existed
 */
export function set<T = IDictionary>(ctx: T) {
  _context = ctx;
}

export function get() {
  return { ...{}, ...baseContext(), ..._context } as ILogContext;
}

/** removes one or more context items */
export function remove(items: string | string[]) {
  if (typeof items === "string") {
    items = [items];
  }

  items.map(item => delete _context[item]);
}

/**
 * Looks for a correlation-id in headers, falls back to requestId if not present,
 * and if the fallback doesn't exist then creates a random string. This is then
 * SET for the duration of the lifecycle.
 */
export function originateCorrelationId(request: IDictionary, reqContext: IDictionary) {
  if (request["x-correlation-id"]) {
    setCorrelationId(request["x-correlation-id"]);
  } else if (
    reqContext.headers &&
    typeof reqContext.headers === "object" &&
    reqContext.headers["x-correlation-id"]
  ) {
    setCorrelationId(reqContext.headers["x-correlation-id"]);
  } else {
    setCorrelationId(
      Math.random()
        .toString(36)
        .substr(2, 10)
    );
  }

  if (reqContext.headers && typeof reqContext.headers === "object") {
    add("User-Agent", reqContext.headers["User-Agent"]);
    add("Debug-Log-Enabled", Math.random() < sampleDebugLogRate ? "true" : "false");
  }
}

export function setCorrelationId(id: string) {
  _context["x-correlation-id"] = id;
}
