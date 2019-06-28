import { IDictionary } from "common-types";
import {
  getSeverity,
  getContext,
  getRootProperties,
  getLocalContext,
  addToLocalContext as addLocalContext,
  getCorrelationId
} from "./state";
import { LogLevel, IAwsLog, IAwsLogConfig } from "../types";
import traverse, { map as tmap } from "traverse";
import { config } from "../logger";
import { sample } from "../shared/sample";

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
  error,
  /**
   * Allows the local context to be appended to
   */
  addToLocalContext,
  /**
   * **addToMaskedValues**
   *
   * _add_ one (to many) parameters of values which should be
   * treated as a secret and never displayed in the logs.
   *
   * If you need to reset this property use `setMaskedValues()`
   * instead.
   */
  addToMaskedValues,
  /**
   * **setMaskedValues**
   *
   * _clears_ out the prior value for "maskedValues" and resets
   * it will whatever is passed in. These values will become the
   * values which are now "masked" instead of what had been there
   * before
   */
  setMaskedValues,
  /**
   * **bespokeMaskingStrategy**
   *
   * Allows a particular _path_ (or _paths_) to have a specific
   * masking strategy
   *
   * @param strategy a string value representing the strategy to employ
   * @param paths  one or more path strings; a "path" should point to the
   * property which you are aiming to effect and will use the period (`.`) character
   * to indicate properties within a hash/dictionary
   */
  pathBasedMaskingStrategy,
  getContext: () => getContext(),
  /**
   * **getCorrelationId**
   *
   * Get's the current correlation ID
   */
  getCorrelationId
};

export type ILoggerApi = typeof loggingApi;
export type IAwsLogMaskingStrategy =
  /** just show astericks and always show length of 5 */
  | "astericksWidthFixed"
  /** show only astericks but the number is equavalent to length of value with a max length of 15 */
  | "astericksWidthDynamic"
  /**
   * show astericks but reveals the real value for last 4 characters
   * (must be at least 10 characters long or reverts to `astericksWidthFixed`)
   */
  | "revealEnd4"
  /**
   * show astericks but reveals the real value for the first 4 characters
   * (must be at least 10 characters long or reverts to `astericksWidthFixed`)
   */
  | "revealStart4";

/** values which should always be masked */
let _maskedValues = new Set([]);
/** properties in the log message which should be masked */
const _maskedProperties = [];

/**
 * A dictionary where the _keys_ are masked-values and _values_ are strategies
 */
let _maskingStrategy: IDictionary<IAwsLogMaskingStrategy> & {
  default: IAwsLogMaskingStrategy;
} = {
  default: "astericksWidthDynamic"
};

function addToMaskedValues(
  ...props: Array<string | [string, IAwsLogMaskingStrategy]>
) {
  const values = props.map(i => {
    if (Array.isArray(i)) {
      const [value, strategy] = i;
      setStrategyForValue(value, strategy);
      return value;
    } else {
      return i;
    }
  });
  _maskedValues = new Set(Array.from(_maskedValues).concat(values));
  return loggingApi;
}

function setStrategyForValue(value: string, strategy: IAwsLogMaskingStrategy) {
  _maskingStrategy[value] = strategy;
}

function pathBasedMaskingStrategy(
  strategy: IAwsLogMaskingStrategy,
  ...paths: string[]
) {
  paths.map(path => {
    _maskingStrategy[path] = strategy;
  });
}

function setMaskedValues(
  ...props: Array<string | [string, IAwsLogMaskingStrategy]>
) {
  _maskedValues = new Set();
  _maskingStrategy = { default: "astericksWidthDynamic" };
  addToMaskedValues(...props);
  return loggingApi;
}

/**
 * **mask**
 *
 * Given an input hash/dictionary, this function checks for masked values
 * and applies the masking strategy to each instance.
 */
function mask<T extends IDictionary = IDictionary>(hash: T) {
  // value-masking strategy
  const cb = function(v: string) {
    if (this.isLeaf && _maskedValues.has(v))
      this.update(applyMask(this.path, v));
  };
  return traverse.map(hash, cb);
}

/**
 * **maskMessage**
 *
 * looks within the message string for secrets and
 * removes them.
 */
function maskMessage(msg: string) {
  Array.from(_maskedValues).map(v => {
    const regEx = new RegExp(v, "g");
    const strategy = _maskingStrategy[v] || _maskingStrategy.default;

    msg = msg.replace(regEx, maskStrategies[strategy](v));
  });

  return msg;
}

function applyMask(path: string[], v: string) {
  const dotPath = path.join(".");
  const strategy: IAwsLogMaskingStrategy =
    _maskingStrategy[v] ||
    _maskingStrategy[dotPath] ||
    _maskingStrategy.default;

  return maskStrategies[strategy](v);
}

const maskStrategies = {
  astericksWidthFixed: (v: string) => "*".repeat(5),
  astericksWidthDynamic: (v: string) => "*".repeat(Math.min(v.length, 15)),
  revealEnd4: (v: string) =>
    v.length >= 5 ? "*".repeat(v.length - 4) + v.slice(-4) : "*".repeat(5),
  revealStart4: (v: string) =>
    v.length >= 5 ? v.slice(0, 4) + "*".repeat(v.length - 4) : "*".repeat(5)
};

/**
 * stdout
 *
 * Takes a localized logging message and adds "context" and all
 * "root level props" (aka, those starting with "@") to the message
 * before logging it to StdOut.
 *
 * @param hash the hash/dictionary coming from one of the logging
 * functions; it should include a "message", optional hash values
 */
export function stdout(hash: Partial<IAwsLog> & { message: string }) {
  const context = getContext();
  const rootProps = getRootProperties();
  const local = getLocalContext();
  hash = mask(hash);

  const output = {
    message: hash.message,
    payload: hash.payload,
    ...{ local },
    ...rootProps,
    ...{ context }
  } as IAwsLog;

  if (process.env.LOG_TESTING) {
    return output;
  } else {
    console.log(JSON.stringify(output, null, 2));
  }
}

export function debug(message: string, params: IDictionary = {}) {
  const status: "all" | "none" =
    config.debug === "sample-by-event"
      ? sample(config.sampleRate)
      : (config.debug as "all" | "none");

  if (status === "all") {
    return stdout({
      message: maskMessage(message),
      severity: LogLevel.debug,
      payload: params
    });
  }
}

export function info(message: string, params: IDictionary = {}) {
  const status: "all" | "none" =
    config.debug === "sample-by-event"
      ? sample(config.sampleRate)
      : (config.debug as "all" | "none");

  if (status === "all") {
    return stdout({
      message: maskMessage(message),
      severity: LogLevel.info,
      payload: params
    });
  }
}

export function warn(message: string, params: IDictionary = {}) {
  const status: "all" | "none" =
    config.debug === "sample-by-event"
      ? sample(config.sampleRate)
      : (config.debug as "all" | "none");

  if (status === "all") {
    return stdout({
      message: maskMessage(message),
      severity: LogLevel.warn,
      payload: params
    });
  }
}

/**
 * Newer versions of JS will have the `code` property
 * on Error but most do not so we are simply extending
 * the boring old Error class to optionally include it
 */
export interface IErrorWithCode extends Error {
  code?: string;
}

export function error(
  /** either a string message, or an error */
  msgOrError: string | IErrorWithCode,
  /** a contextual dictionary or an error */
  paramsOrErr?: IDictionary | IErrorWithCode,
  /** an error object */
  err?: IErrorWithCode
) {
  const status =
    config.debug === "sample-by-event"
      ? sample(config.sampleRate)
      : config.debug;

  const context = getContext();
  const { message, params, error } = parseErrParameters(
    msgOrError,
    paramsOrErr,
    err
  );

  if (status === "all") {
    return stdout({
      message,
      severity: LogLevel.error,
      isError: true,
      payload: {
        params,
        error
      }
    });
  }
}

function parseErrParameters(
  msgOrError: string | IDictionary | IErrorWithCode,
  paramsOrErr?: IDictionary | IErrorWithCode,
  err?: IErrorWithCode
) {
  const isAnError = (thingy: any) => {
    return typeof thingy === "object" && thingy.message && thingy.name
      ? true
      : false;
  };
  return isAnError(msgOrError)
    ? {
        message: (msgOrError as IErrorWithCode).message as string,
        params: {},
        error: msgOrError as IErrorWithCode
      }
    : isAnError(paramsOrErr)
    ? {
        message: msgOrError as string,
        params: {},
        error: paramsOrErr as IErrorWithCode
      }
    : {
        message: msgOrError as string,
        params: paramsOrErr as IDictionary,
        error: err
      };
}

export function addToLocalContext(ctx: IDictionary) {
  addLocalContext(ctx);

  return loggingApi;
}

export const __testAccess__ = {
  mask,
  maskStrategies,
  setMaskedValues,
  pathBasedMaskingStrategy,
  maskMessage
};
